from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: str | None = None


class UserCreate(UserBase):
    password: str
    role: str = "client"


class UserUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None


class UserResponse(UserBase):
    id: UUID
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ClientWithStatus(UserResponse):
    status: str = "active"


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    refresh_token: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
