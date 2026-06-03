"""Attendance check-in routes for updating participant check-in status."""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Participant
from app.schemas import CheckInResponse
from app.security import get_current_admin, decrypt_aadhaar
from app.services.email_service import send_checkin_confirmation_email

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])


@router.post("/checkin/{registration_id}", response_model=CheckInResponse)
def api_check_in(
    registration_id: str,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    """Mark a participant as present and record the check-in time."""
    participant = db.query(Participant).filter(Participant.registration_id == registration_id).first()
    
    if not participant:
        return CheckInResponse(
            success=False,
            status="INVALID_PASS",
            message="No registration found with this ID.",
            data=None
        )

    if participant.attendance_status == "PRESENT":
        p_dict = participant.to_dict()
        return CheckInResponse(
            success=True,
            status="ALREADY_CHECKED_IN",
            message="Participant is already checked in.",
            data=p_dict
        )

    # Check if payment is verified for external participants
    if participant.participant_type == "EXTERNAL" and participant.payment_status != "PAID":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot check in. Payment status is PENDING/FAILED."
        )

    # Update attendance status
    participant.attendance_status = "PRESENT"
    participant.checked_in_at = datetime.utcnow()
    
    try:
        db.commit()
        db.refresh(participant)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record check-in: {str(e)}"
        )

    p_dict = participant.to_dict()
    # Decrypt Aadhaar for response
    try:
        p_dict["aadhaar_number"] = decrypt_aadhaar(participant.aadhaar_encrypted)
    except Exception:
        p_dict["aadhaar_number"] = None

    # Send confirmation email
    send_checkin_confirmation_email(
        to_email=participant.email,
        full_name=participant.full_name,
        registration_id=participant.registration_id
    )

    return CheckInResponse(
        success=True,
        status="CHECKED_IN",
        message="Check-in completed successfully.",
        data=p_dict
    )
