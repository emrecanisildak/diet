import json
import os
import uuid as uuid_mod
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func

from app.database import get_db, SessionLocal
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.message import Message
from app.schemas.message import MessageCreate, MessageResponse, ConversationResponse
from app.utils.auth import decode_token

router = APIRouter(prefix="/messages", tags=["messages"])

# WebSocket connection manager
active_connections: dict[str, WebSocket] = {}

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads", "messages")
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.get("/conversations", response_model=list[ConversationResponse])
def get_conversations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sent_to = db.query(Message.receiver_id).filter(Message.sender_id == current_user.id).distinct()
    received_from = db.query(Message.sender_id).filter(Message.receiver_id == current_user.id).distinct()

    user_ids = set()
    for (uid,) in sent_to:
        user_ids.add(uid)
    for (uid,) in received_from:
        user_ids.add(uid)

    conversations = []
    for uid in user_ids:
        user = db.query(User).filter(User.id == uid).first()
        if not user:
            continue

        last_msg = (
            db.query(Message)
            .filter(
                or_(
                    and_(Message.sender_id == current_user.id, Message.receiver_id == uid),
                    and_(Message.sender_id == uid, Message.receiver_id == current_user.id),
                )
            )
            .order_by(Message.created_at.desc())
            .first()
        )

        unread = (
            db.query(func.count(Message.id))
            .filter(Message.sender_id == uid, Message.receiver_id == current_user.id, Message.is_read == False)
            .scalar()
        )

        if last_msg:
            last_message_text = last_msg.content if last_msg.content else "[Fotoğraf]"
            conversations.append(
                ConversationResponse(
                    user_id=uid,
                    full_name=user.full_name,
                    last_message=last_message_text,
                    last_message_at=last_msg.created_at,
                    unread_count=unread or 0,
                )
            )

    conversations.sort(key=lambda c: c.last_message_at, reverse=True)
    return conversations


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Sadece resim dosyaları yüklenebilir")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Dosya boyutu 10MB'dan büyük olamaz")

    ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename and "." in file.filename else "jpg"
    allowed_ext = {"jpg", "jpeg", "png", "gif", "webp", "heic"}
    if ext not in allowed_ext:
        ext = "jpg"

    filename = f"{uuid_mod.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(content)

    return {"image_url": f"/uploads/messages/{filename}"}


@router.get("/{user_id}", response_model=list[MessageResponse])
def get_messages(user_id: UUID, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    messages = (
        db.query(Message)
        .filter(
            or_(
                and_(Message.sender_id == current_user.id, Message.receiver_id == user_id),
                and_(Message.sender_id == user_id, Message.receiver_id == current_user.id),
            )
        )
        .order_by(Message.created_at)
        .all()
    )

    # Mark messages from the other user as read
    db.query(Message).filter(
        Message.sender_id == user_id, Message.receiver_id == current_user.id, Message.is_read == False
    ).update({"is_read": True})
    db.commit()

    return messages


@router.post("", response_model=MessageResponse, status_code=201)
def send_message(msg_data: MessageCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    message = Message(
        sender_id=current_user.id,
        receiver_id=msg_data.receiver_id,
        content=msg_data.content,
        image_url=msg_data.image_url,
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    # Send via WebSocket if receiver is online
    receiver_key = str(msg_data.receiver_id)
    if receiver_key in active_connections:
        import asyncio

        ws = active_connections[receiver_key]
        msg_response = MessageResponse.model_validate(message)
        try:
            asyncio.create_task(ws.send_text(msg_response.model_dump_json()))
        except Exception:
            pass

    return message


@router.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str):
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        await websocket.close(code=1008)
        return

    user_id = payload.get("sub")
    await websocket.accept()
    active_connections[user_id] = websocket

    try:
        while True:
            data = await websocket.receive_text()
            msg_data = json.loads(data)

            db = SessionLocal()
            try:
                message = Message(
                    sender_id=UUID(user_id),
                    receiver_id=UUID(msg_data["receiver_id"]),
                    content=msg_data.get("content"),
                    image_url=msg_data.get("image_url"),
                )
                db.add(message)
                db.commit()
                db.refresh(message)

                msg_response = MessageResponse.model_validate(message)
                msg_json = msg_response.model_dump_json()

                # Send to sender
                await websocket.send_text(msg_json)

                # Send to receiver if online
                receiver_key = msg_data["receiver_id"]
                if receiver_key in active_connections:
                    await active_connections[receiver_key].send_text(msg_json)
            finally:
                db.close()
    except WebSocketDisconnect:
        active_connections.pop(user_id, None)
