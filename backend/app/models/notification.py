import uuid
from datetime import datetime
from sqlalchemy import String, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User")


class ScheduledNotification(Base):
    __tablename__ = "scheduled_notifications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Types: "once", "daily"
    schedule_type: Mapped[str] = mapped_column(String(50), default="once")
    
    # For "once": specific date/time. For "daily": HH:MM
    scheduled_time: Mapped[str] = mapped_column(String(50), nullable=False)
    
    # Target: "all" or specific user_id (optional for now, mainly "all")
    target_type: Mapped[str] = mapped_column(String(50), default="all")
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_sent_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
