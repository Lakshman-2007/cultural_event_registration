"""Registration routes for the portal."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import (
    RegistrationRequest,
    RegistrationResponse,
    CheckEmailRequest,
    CheckEmailResponse,
    EventPassResponse
)
from app.services.registration_service import register_participant, check_email_exists
from app.models import Participant

router = APIRouter(prefix="/api", tags=["Registration"])


@router.post("/register", response_model=RegistrationResponse)
def api_register(request: RegistrationRequest, db: Session = Depends(get_db)):
    """Register a new participant (internal or external)."""
    try:
        registration_data = register_participant(db, request)
        return RegistrationResponse(
            success=True,
            message="Registration initiated successfully.",
            data=registration_data
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/register/check-email", response_model=CheckEmailResponse)
def api_check_email(request: CheckEmailRequest, db: Session = Depends(get_db)):
    """Check if an email is available for registration."""
    exists = check_email_exists(db, request.email)
    if exists:
        return CheckEmailResponse(
            available=False,
            message="This email is already registered."
        )
    return CheckEmailResponse(
        available=True,
        message="Email is available for registration."
    )


@router.get("/pass/{registration_id}", response_model=EventPassResponse)
def api_get_pass(registration_id: str, db: Session = Depends(get_db)):
    """Retrieve event pass details for a registered participant."""
    participant = db.query(Participant).filter(Participant.registration_id == registration_id).first()
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration ID not found."
        )
    
    # We should return the participant details in the data field
    data = participant.to_dict()
    return EventPassResponse(
        success=True,
        message="Pass details retrieved successfully.",
        data=data
    )
