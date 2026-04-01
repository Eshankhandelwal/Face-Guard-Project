from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ── Auth ────────────────────────────────────
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str = "citizen"


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str


# ── Missing Person ───────────────────────────
class MissingPersonOut(BaseModel):
    id: int
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    description: Optional[str] = None
    last_seen_location: Optional[str] = None
    photo_url: Optional[str] = None
    status: str
    contact_number: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Alert ────────────────────────────────────
class AlertOut(BaseModel):
    id: int
    person_id: int
    confidence: float
    location: Optional[str] = None
    camera_id: Optional[str] = None
    screenshot_url: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Lost Item ────────────────────────────────
class LostItemOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    last_seen_location: Optional[str] = None
    photo_url: Optional[str] = None
    contact_number: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True