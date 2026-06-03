"""Mock email service that logs emails to console."""

from datetime import datetime


def send_registration_email(
    to_email: str,
    full_name: str,
    registration_id: str,
    participant_type: str,
    payment_status: str,
    payment_amount: float,
) -> bool:
    """
    Send a registration confirmation email (mock implementation).
    
    In production, this would integrate with an SMTP server or email API
    like SendGrid/Mailgun. For development, it logs to console.
    
    Args:
        to_email: Recipient email address.
        full_name: Participant's full name.
        registration_id: Generated registration ID.
        participant_type: INTERNAL or EXTERNAL.
        payment_status: FREE, PENDING, PAID, or FAILED.
        payment_amount: Payment amount in INR.
        
    Returns:
        True if email was "sent" successfully.
    """
    timestamp = datetime.utcnow().isoformat()
    
    print("=" * 70)
    print(f"[EMAIL SERVICE] Registration Confirmation Email")
    print(f"[EMAIL SERVICE] Timestamp: {timestamp}")
    print(f"[EMAIL SERVICE] To: {to_email}")
    print(f"[EMAIL SERVICE] Subject: Cultural Event 2026 - Registration Confirmed")
    print("-" * 70)
    print(f"  Dear {full_name},")
    print()
    print(f"  Your registration for the Hindustan University Cultural Event 2026")
    print(f"  has been confirmed successfully!")
    print()
    print(f"  Registration Details:")
    print(f"  - Registration ID: {registration_id}")
    print(f"  - Participant Type: {participant_type}")
    print(f"  - Payment Status: {payment_status}")
    print(f"  - Amount: INR {payment_amount:.2f}")
    print()
    if payment_status == "PENDING":
        print(f"  Please complete your payment of INR {payment_amount:.2f} to confirm")
        print(f"  your participation.")
        print()
    print(f"  Please keep your Registration ID safe. You will need it for")
    print(f"  entry on the event day.")
    print()
    print(f"  Best Regards,")
    print(f"  Hindustan University Cultural Committee")
    print("=" * 70)
    
    return True


def send_payment_confirmation_email(
    to_email: str,
    full_name: str,
    registration_id: str,
    transaction_id: str,
    amount: float,
) -> bool:
    """
    Send a payment confirmation email (mock implementation).
    
    Args:
        to_email: Recipient email address.
        full_name: Participant's full name.
        registration_id: Registration ID.
        transaction_id: Payment transaction ID.
        amount: Paid amount in INR.
        
    Returns:
        True if email was "sent" successfully.
    """
    timestamp = datetime.utcnow().isoformat()
    
    print("=" * 70)
    print(f"[EMAIL SERVICE] Payment Confirmation Email")
    print(f"[EMAIL SERVICE] Timestamp: {timestamp}")
    print(f"[EMAIL SERVICE] To: {to_email}")
    print(f"[EMAIL SERVICE] Subject: Payment Confirmed - Cultural Event 2026")
    print("-" * 70)
    print(f"  Dear {full_name},")
    print()
    print(f"  Your payment has been received and confirmed!")
    print()
    print(f"  Payment Details:")
    print(f"  - Registration ID: {registration_id}")
    print(f"  - Transaction ID: {transaction_id}")
    print(f"  - Amount Paid: INR {amount:.2f}")
    print()
    print(f"  Your event pass is now active. Please carry your QR code")
    print(f"  on the event day for entry.")
    print()
    print(f"  Best Regards,")
    print(f"  Hindustan University Cultural Committee")
    print("=" * 70)
    
    return True


def send_checkin_confirmation_email(
    to_email: str,
    full_name: str,
    registration_id: str,
) -> bool:
    """
    Send a check-in confirmation email (mock implementation).
    
    Args:
        to_email: Recipient email address.
        full_name: Participant's full name.
        registration_id: Registration ID.
        
    Returns:
        True if email was "sent" successfully.
    """
    timestamp = datetime.utcnow().isoformat()
    
    print("=" * 70)
    print(f"[EMAIL SERVICE] Check-in Confirmation Email")
    print(f"[EMAIL SERVICE] Timestamp: {timestamp}")
    print(f"[EMAIL SERVICE] To: {to_email}")
    print(f"[EMAIL SERVICE] Subject: Welcome! Check-in Confirmed - Cultural Event 2026")
    print("-" * 70)
    print(f"  Dear {full_name},")
    print()
    print(f"  You have been successfully checked in for the event!")
    print(f"  Registration ID: {registration_id}")
    print()
    print(f"  Enjoy the Cultural Event 2026!")
    print()
    print(f"  Best Regards,")
    print(f"  Hindustan University Cultural Committee")
    print("=" * 70)
    
    return True
