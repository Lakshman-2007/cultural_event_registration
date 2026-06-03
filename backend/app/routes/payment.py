"""Payment routes for mock Razorpay flow."""

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import (
    CreateOrderRequest,
    CreateOrderResponse,
    VerifyPaymentRequest,
    VerifyPaymentResponse
)
from app.models import Participant
from app.services.email_service import send_payment_confirmation_email

router = APIRouter(prefix="/api/payment", tags=["Payment"])


@router.post("/create-order", response_model=CreateOrderResponse)
def api_create_order(request: CreateOrderRequest, db: Session = Depends(get_db)):
    """Create a mock Razorpay order."""
    participant = db.query(Participant).filter(Participant.registration_id == request.registration_id).first()
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration ID not found."
        )

    # Validate amount
    if abs(participant.payment_amount - request.amount) > 0.01:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment amount mismatch."
        )

    order_id = f"mock_order_{uuid.uuid4().hex[:12]}"
    
    return CreateOrderResponse(
        success=True,
        order_id=order_id,
        amount=request.amount,
        registration_id=request.registration_id
    )


@router.post("/verify", response_model=VerifyPaymentResponse)
def api_verify_payment(request: VerifyPaymentRequest, db: Session = Depends(get_db)):
    """Verify mock Razorpay payment signature/details and mark participant as PAID."""
    participant = db.query(Participant).filter(Participant.registration_id == request.registration_id).first()
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration ID not found."
        )

    # Check if already paid
    if participant.payment_status == "PAID":
        return VerifyPaymentResponse(
            success=True,
            message="Payment has already been processed.",
            payment_status="PAID",
            registration_id=request.registration_id
        )

    # Update participant payment details
    participant.payment_status = "PAID"
    participant.transaction_id = request.transaction_id
    
    try:
        db.commit()
        db.refresh(participant)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record payment: {str(e)}"
        )

    # Send confirmation email
    send_payment_confirmation_email(
        to_email=participant.email,
        full_name=participant.full_name,
        registration_id=participant.registration_id,
        transaction_id=request.transaction_id,
        amount=participant.payment_amount
    )

    return VerifyPaymentResponse(
        success=True,
        message="Payment verified and registration completed.",
        payment_status="PAID",
        registration_id=request.registration_id
    )
