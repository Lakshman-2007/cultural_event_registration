"""QR Code scan endpoint for looking up participant details by registration ID."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Participant
from app.schemas import QRScanResponse
from app.security import get_current_admin, decrypt_aadhaar

router = APIRouter(prefix="/api/qr", tags=["QR Scanner"])


@router.get("/scan/{registration_id}", response_model=QRScanResponse)
def api_scan_qr(
    registration_id: str,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    """Scan a participant's QR code (Registration ID) and retrieve details."""
    participant = db.query(Participant).filter(Participant.registration_id == registration_id).first()
    
    if not participant:
        return QRScanResponse(
            status="INVALID_PASS",
            message="No registration found with this ID.",
            data=None
        )

    # Decrypt Aadhaar for display
    aadhaar_number = "Error decrypting Aadhaar"
    try:
        aadhaar_number = decrypt_aadhaar(participant.aadhaar_encrypted)
    except Exception as e:
        print(f"Error decrypting Aadhaar for {registration_id}: {e}")

    p_dict = participant.to_dict()
    p_dict["aadhaar_number"] = aadhaar_number

    if participant.attendance_status == "PRESENT":
        return QRScanResponse(
            status="ALREADY_CHECKED_IN",
            message="This participant has already checked in.",
            data=p_dict
        )

    # Check if payment is pending (for paid participants)
    if participant.payment_status == "PENDING":
        return QRScanResponse(
            status="VALID_PASS",
            message="Pass is valid but payment is PENDING. Verify payment before checking in.",
            data=p_dict
        )

    return QRScanResponse(
        status="VALID_PASS",
        message="Pass is valid. Ready for check-in.",
        data=p_dict
    )
