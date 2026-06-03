"""SQLAlchemy models for the Cultural Event Registration Portal."""

from sqlalchemy import Column, Integer, String, Float, Text, DateTime, func
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


class Participant(Base):
    """Participant model storing all registration details."""

    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, autoincrement=True)
    registration_id = Column(String(20), unique=True, nullable=False, index=True)
    full_name = Column(String(100), nullable=False)
    mobile = Column(String(15), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    address = Column(Text, nullable=False)
    aadhaar_encrypted = Column(Text, nullable=False)
    college_name = Column(String(200), nullable=False)
    register_number = Column(String(50), nullable=False)
    department = Column(String(100), nullable=False)
    year_of_study = Column(String(10), nullable=False)
    participant_type = Column(String(10), nullable=False)  # INTERNAL or EXTERNAL
    payment_status = Column(String(10), nullable=False)  # FREE, PENDING, PAID, FAILED
    payment_amount = Column(Float, default=0.0)
    transaction_id = Column(String(100), nullable=True)
    attendance_status = Column(String(10), default="ABSENT")  # ABSENT or PRESENT
    checked_in_at = Column(DateTime, nullable=True)
    qr_code_data = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())

    def to_dict(self):
        """Convert the model instance to a dictionary, excluding encrypted fields."""
        return {
            "id": self.id,
            "registration_id": self.registration_id,
            "full_name": self.full_name,
            "mobile": self.mobile,
            "email": self.email,
            "address": self.address,
            "college_name": self.college_name,
            "register_number": self.register_number,
            "department": self.department,
            "year_of_study": self.year_of_study,
            "participant_type": self.participant_type,
            "payment_status": self.payment_status,
            "payment_amount": self.payment_amount,
            "transaction_id": self.transaction_id,
            "attendance_status": self.attendance_status,
            "checked_in_at": self.checked_in_at.isoformat() if self.checked_in_at else None,
            "qr_code_data": self.qr_code_data,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Admin(Base):
    """Admin model for portal administration."""

    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)

    def to_dict(self):
        """Convert the model instance to a dictionary."""
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
        }
