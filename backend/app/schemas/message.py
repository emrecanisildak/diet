from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, model_validator


class MessageCreate(BaseModel):
    receiver_id: UUID
    content: str | None = None
    image_url: str | None = None

    @model_validator(mode="after")
    def check_content_or_image(self):
        if not self.content and not self.image_url:
            raise ValueError("content veya image_url gerekli")
        return self


class MessageResponse(BaseModel):
    id: UUID
    sender_id: UUID
    receiver_id: UUID
    content: str | None
    image_url: str | None
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationResponse(BaseModel):
    user_id: UUID
    full_name: str
    last_message: str | None
    last_message_at: datetime
    unread_count: int
