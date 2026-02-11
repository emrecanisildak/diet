from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class AppointmentBase(BaseModel):
    title: str
    date_time: datetime
    duration_minutes: int = 30
    notes: str | None = None


class AppointmentCreate(AppointmentBase):
    client_id: UUID


class AppointmentUpdate(BaseModel):
    title: str | None = None
    date_time: datetime | None = None
    duration_minutes: int | None = None
    status: str | None = None
    notes: str | None = None


class AppointmentResponse(AppointmentBase):
    id: UUID
    dietitian_id: UUID
    client_id: UUID
    status: str

    model_config = {"from_attributes": True}
