from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="citizen")  # admin, officer, citizen
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)


class MissingPerson(Base):
    __tablename__ = "missing_persons"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer)
    gender = Column(String)
    description = Column(Text)
    last_seen_location = Column(String)
    photo_url = Column(String)
    face_encoding = Column(Text)  # JSON string of face embedding
    status = Column(String, default="missing")  # missing, found
    reported_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    contact_number = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    reporter = relationship("User", foreign_keys=[reported_by])
    alerts = relationship("Alert", back_populates="person")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    person_id = Column(Integer, ForeignKey("missing_persons.id"))
    confidence = Column(Float)
    location = Column(String)
    camera_id = Column(String)
    screenshot_url = Column(String)
    status = Column(String, default="new")  # new, reviewed, dismissed
    created_at = Column(DateTime, default=datetime.utcnow)

    person = relationship("MissingPerson", back_populates="alerts")


class LostItem(Base):
    __tablename__ = "lost_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String)
    last_seen_location = Column(String)
    photo_url = Column(String)
    contact_number = Column(String)
    status = Column(String, default="lost")  # lost, found
    reported_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    reporter = relationship("User", foreign_keys=[reported_by])