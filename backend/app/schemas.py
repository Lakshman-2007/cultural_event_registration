"""Pydantic schemas for request validation and response serialization."""

from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
import re


# ==================== Registration Schemas ====================

class RegistrationRequest(BaseModel):
    """Schema for participant registration request."""
    full_name: str
    mobile: str
    email: str
    address: str
    aadhaar_number: str
    college_name: str
    register_number: str
    department: str
    year_of_study: str

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) < 2:
            raise ValueError("Full name must be at least 2 characters")
        if len(v) > 100:
            raise ValueError("Full name must not exceed 100 characters")
        return v

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, v: str) -> str:
        v = v.strip()
        if not re.match(r"^\d{10}$", v):
            raise ValueError("Mobile number must be exactly 10 digits")
        return v

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", v):
            raise ValueError("Invalid email format")
        return v

    @field_validator("aadhaar_number")
    @classmethod
    def validate_aadhaar(cls, v: str) -> str:
        v = v.strip()
        if not re.match(r"^\d{12}$", v):
            raise ValueError("Aadhaar number must be exactly 12 digits")
        return v

    @field_validator("address")
    @classmethod
    def validate_address(cls, v: str) -> str:
        v = v.strip()
        if not v or len(v) < 5:
            raise ValueError("Address must be at least 5 characters")
        return v

    @field_validator("college_name")
    @classmethod
    def validate_college_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("College name is required")
        return v

    @field_validator("register_number")
    @classmethod
    def validate_register_number(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Register number is required")
        return v

    @field_validator("department")
    @classmethod
    def validate_department(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Department is required")
        return v

    @field_validator("year_of_study")
    @classmethod
    def validate_year_of_study(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Year of study is required")
        return v


class RegistrationResponse(BaseModel):
    """Schema for registration response."""
    success: bool
    message: str
    data: Optional[dict] = None


class CheckEmailRequest(BaseModel):
    """Schema for email uniqueness check."""
    email: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", v):
            raise ValueError("Invalid email format")
        return v


class CheckEmailResponse(BaseModel):
    """Schema for email check response."""
    available: bool
    message: str


# ==================== Payment Schemas ====================

class CreateOrderRequest(BaseModel):
    """Schema for creating a mock payment order."""
    registration_id: str
    amount: float


class CreateOrderResponse(BaseModel):
    """Schema for payment order creation response."""
    success: bool
    order_id: str
    amount: float
    registration_id: str


class VerifyPaymentRequest(BaseModel):
    """Schema for verifying a mock payment."""
    registration_id: str
    transaction_id: str
    order_id: str


class VerifyPaymentResponse(BaseModel):
    """Schema for payment verification response."""
    success: bool
    message: str
    payment_status: str
    registration_id: str


# ==================== Admin Schemas ====================

class AdminLoginRequest(BaseModel):
    """Schema for admin login."""
    email: str
    password: str


class AdminLoginResponse(BaseModel):
    """Schema for admin login response."""
    success: bool
    message: str
    token: Optional[str] = None
    admin: Optional[dict] = None


class DashboardMetrics(BaseModel):
    """Schema for admin dashboard metrics."""
    total_registrations: int
    internal_count: int
    external_count: int
    total_revenue: float
    checked_in_count: int
    pending_count: int


class DashboardResponse(BaseModel):
    """Schema for dashboard response."""
    success: bool
    metrics: DashboardMetrics


class ParticipantDetail(BaseModel):
    """Schema for individual participant detail."""
    id: int
    registration_id: str
    full_name: str
    mobile: str
    email: str
    address: str
    aadhaar_number: Optional[str] = None
    college_name: str
    register_number: str
    department: str
    year_of_study: str
    participant_type: str
    payment_status: str
    payment_amount: float
    transaction_id: Optional[str] = None
    attendance_status: str
    checked_in_at: Optional[str] = None
    qr_code_data: Optional[str] = None
    created_at: Optional[str] = None


class PaginatedParticipantsResponse(BaseModel):
    """Schema for paginated participants list."""
    success: bool
    data: List[ParticipantDetail]
    total: int
    page: int
    per_page: int
    total_pages: int


class ParticipantResponse(BaseModel):
    """Schema for single participant response."""
    success: bool
    data: Optional[ParticipantDetail] = None
    message: Optional[str] = None


# ==================== QR / Attendance Schemas ====================

class QRScanResponse(BaseModel):
    """Schema for QR scan result."""
    status: str  # VALID_PASS, ALREADY_CHECKED_IN, INVALID_PASS
    message: str
    data: Optional[dict] = None


class CheckInResponse(BaseModel):
    """Schema for attendance check-in response."""
    success: bool
    status: str  # CHECKED_IN, ALREADY_CHECKED_IN, INVALID_PASS
    message: str
    data: Optional[dict] = None


# ==================== Pass Schemas ====================

class EventPassResponse(BaseModel):
    """Schema for event pass retrieval."""
    success: bool
    message: str
    data: Optional[dict] = None
