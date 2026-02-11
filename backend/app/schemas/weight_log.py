from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class WeightLogBase(BaseModel):
    weight: float
    note: str | None = None


class WeightLogCreate(WeightLogBase):
    pass


class WeightLogResponse(WeightLogBase):
    id: UUID
    client_id: UUID
    logged_at: datetime

    model_config = {"from_attributes": True}
