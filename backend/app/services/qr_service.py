"""QR Code generation service."""

import qrcode
import io
import base64


def generate_qr_code(data: str) -> str:
    """
    Generate a QR code containing the given data and return it as a base64-encoded PNG string.
    
    Args:
        data: The string data to encode in the QR code (registration_id).
        
    Returns:
        Base64-encoded PNG image string prefixed with data URI scheme.
    """
    # Create QR code instance
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    # Encode full URL so scanning with a regular phone camera works
    base_url = "http://localhost:5173/pass"
    qr.add_data(f"{base_url}/{data}")
    qr.make(fit=True)

    # Generate image
    img = qr.make_image(fill_color="black", back_color="white")

    # Convert to base64 PNG
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    
    img_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
    
    return f"data:image/png;base64,{img_base64}"
