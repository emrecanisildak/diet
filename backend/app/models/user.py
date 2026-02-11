import uuid
from datetime import datetime

from sqlalchemy import String, Enum as SAEnum, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(SAEnum("dietitian", "client", name="user_role"), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True)
    apns_token: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    dietitian_clients: Mapped[list["DietitianClient"]] = relationship(
        "DietitianClient", foreign_keys="DietitianClient.dietitian_id", back_populates="dietitian"
    )
    client_of: Mapped[list["DietitianClient"]] = relationship(
        "DietitianClient", foreign_keys="DietitianClient.client_id", back_populates="client"
    )


class DietitianClient(Base):
    __tablename__ = "dietitian_clients"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dietitian_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    client_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status: Mapped[str] = mapped_column(SAEnum("active", "inactive", name="client_status"), default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    dietitian: Mapped["User"] = relationship("User", foreign_keys=[dietitian_id], back_populates="dietitian_clients")
    client: Mapped["User"] = relationship("User", foreign_keys=[client_id], back_populates="client_of")
