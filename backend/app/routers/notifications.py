import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Literal

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.notification import Notification, ScheduledNotification
from app.services.notification_service import notification_service
from pydantic import BaseModel, field_validator

router = APIRouter(prefix="/notifications", tags=["notifications"])

class BulkNotificationRequest(BaseModel):
    title: str
    content: str

class ScheduledNotificationCreate(BaseModel):
    title: str
    content: str
    schedule_type: Literal["once", "daily"]
    scheduled_time: str  # ISO format for "once", "HH:MM" for "daily"

    @field_validator("scheduled_time")
    @classmethod
    def validate_scheduled_time(cls, v, info):
        schedule_type = info.data.get("schedule_type")
        if schedule_type == "daily":
            if not re.match(r"^\d{2}:\d{2}$", v):
                raise ValueError("Daily notifications require HH:MM format")
            hour, minute = map(int, v.split(":"))
            if not (0 <= hour <= 23 and 0 <= minute <= 59):
                raise ValueError("Invalid time value")
        return v

@router.post("/send-bulk")
def send_bulk_notification(
    data: BulkNotificationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "dietitian":
        raise HTTPException(status_code=403, detail="Only dietitians can send bulk notifications")
    
    notification_service.send_bulk_push(db, data.title, data.content)
    return {"message": "Bulk notifications sent successfully"}

@router.post("/schedule")
def schedule_notification(
    data: ScheduledNotificationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "dietitian":
        raise HTTPException(status_code=403, detail="Only dietitians can schedule notifications")
    
    scheduled = ScheduledNotification(
        title=data.title,
        content=data.content,
        schedule_type=data.schedule_type,
        scheduled_time=data.scheduled_time
    )
    db.add(scheduled)
    db.commit()
    db.refresh(scheduled)
    return scheduled

@router.get("/scheduled")
def get_scheduled_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "dietitian":
        raise HTTPException(status_code=403, detail="Only dietitians can view scheduled notifications")
    
    return db.query(ScheduledNotification).order_by(ScheduledNotification.created_at.desc()).all()

@router.delete("/scheduled/{id}")
def cancel_scheduled_notification(
    id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "dietitian":
        raise HTTPException(status_code=403, detail="Only dietitians can cancel notifications")
    
    scheduled = db.query(ScheduledNotification).filter(ScheduledNotification.id == id).first()
    if not scheduled:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    db.delete(scheduled)
    db.commit()
    return {"message": "Scheduled notification cancelled"}

@router.get("")
def list_my_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )


@router.post("/{notification_id}/read")
def mark_notification_read(
    notification_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == current_user.id)
        .first()
    )
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}


@router.post("/read-all")
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}


@router.post("/register-token")
def register_apns_token(
    token: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.apns_token = token
    db.commit()
    return {"message": "APNs token registered successfully"}
