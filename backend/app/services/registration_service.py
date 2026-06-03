"""Registration service with business logic for participant registration."""

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models import Participant
from app.schemas import RegistrationRequest
from app.config import settings
from app.security import encrypt_aadhaar
from app.utils.id_generator import generate_registration_id
from app.services.qr_service import generate_qr_code
from app.services.email_service import send_registration_email


def check_email_exists(db: Session, email: str) -> bool:
    """Check if an email is already registered."""
    return db.query(Participant).filter(Participant.email == email).first() is not None


def determine_participant_type(email: str, register_number: str) -> tuple[str, str, float]:
    """
    Determine if a participant is INTERNAL or EXTERNAL based on their email.
    
    Rules:
    - If email ends with @student.hindustanuniv.ac.in AND
      the email prefix (before @) matches the register_number → INTERNAL
    - Otherwise → EXTERNAL
    
    Returns:
        Tuple of (participant_type, payment_status, payment_amount)
    """
    internal_domain = settings.INTERNAL_EMAIL_DOMAIN
    
    if email.endswith(internal_domain):
        # Extract the prefix (part before @)
        email_prefix = email.split("@")[0].strip().lower()
        reg_num_clean = register_number.strip().lower()
        
        if email_prefix == reg_num_clean:
            return "INTERNAL", "FREE", 0.0
    
    return "EXTERNAL", "PENDING", settings.PAYMENT_AMOUNT_EXTERNAL


def register_participant(db: Session, request: RegistrationRequest) -> dict:
    """
    Complete registration flow:
    1. Validate email uniqueness
    2. Determine participant type (INTERNAL/EXTERNAL)
    3. Encrypt Aadhaar number
    4. Generate registration ID
    5. Generate QR code
    6. Save to database
    7. Send confirmation email
    8. Return registration data
    
    Args:
        db: Database session
        request: Validated registration request
        
    Returns:
        Dictionary with registration details
        
    Raises:
        HTTPException: If email already exists or other validation fails
    """
    # 1. Check email uniqueness
    if check_email_exists(db, request.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This email address is already registered. Please use a different email or retrieve your existing pass.",
        )

    # 2. Determine participant type
    participant_type, payment_status, payment_amount = determine_participant_type(
        request.email, request.register_number
    )

    # 3. Encrypt Aadhaar
    aadhaar_encrypted = encrypt_aadhaar(request.aadhaar_number)

    # 4. Generate registration ID
    registration_id = generate_registration_id(db)

    # 5. Generate QR code
    qr_code_data = generate_qr_code(registration_id)

    # 6. Create and save participant
    participant = Participant(
        registration_id=registration_id,
        full_name=request.full_name,
        mobile=request.mobile,
        email=request.email,
        address=request.address,
        aadhaar_encrypted=aadhaar_encrypted,
        college_name=request.college_name,
        register_number=request.register_number,
        department=request.department,
        year_of_study=request.year_of_study,
        participant_type=participant_type,
        payment_status=payment_status,
        payment_amount=payment_amount,
        qr_code_data=qr_code_data,
    )

    try:
        db.add(participant)
        db.commit()
        db.refresh(participant)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save registration: {str(e)}",
        )

    # 7. Send confirmation email (fire-and-forget for mock)
    try:
        send_registration_email(
            to_email=request.email,
            full_name=request.full_name,
            registration_id=registration_id,
            participant_type=participant_type,
            payment_status=payment_status,
            payment_amount=payment_amount,
        )
    except Exception as email_err:
        # Email is non-critical — log and continue
        print(f"[WARNING] Failed to send confirmation email: {email_err}")

    # 8. Return registration data
    response_data = {
        "registration_id": registration_id,
        "full_name": participant.full_name,
        "email": participant.email,
        "mobile": participant.mobile,
        "college_name": participant.college_name,
        "register_number": participant.register_number,
        "department": participant.department,
        "year_of_study": participant.year_of_study,
        "participant_type": participant_type,
        "payment_status": payment_status,
        "payment_amount": payment_amount,
        "qr_code_data": qr_code_data,
        "created_at": participant.created_at.isoformat() if participant.created_at else None,
    }

    return response_data
