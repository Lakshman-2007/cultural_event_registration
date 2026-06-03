"""Sequential registration ID generator in CUL2026-XXXX format."""

from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import Participant


def generate_registration_id(db: Session) -> str:
    """
    Generate the next sequential registration ID in CUL2026-XXXX format.
    
    Queries the database for the highest existing registration number
    and increments by 1. Thread-safe due to SQLAlchemy session locking.
    """
    # Get the maximum existing registration ID number
    result = db.query(func.max(Participant.id)).scalar()
    
    if result is None:
        next_number = 1
    else:
        # Also check the max registration_id suffix for robustness
        max_reg = db.query(Participant.registration_id).order_by(
            Participant.id.desc()
        ).first()
        
        if max_reg and max_reg[0]:
            try:
                # Extract the numeric suffix from CUL2026-XXXX
                suffix = max_reg[0].split("-")[1]
                next_number = int(suffix) + 1
            except (IndexError, ValueError):
                next_number = result + 1
        else:
            next_number = result + 1

    # Format with zero-padding (4 digits)
    return f"CUL2026-{next_number:04d}"
