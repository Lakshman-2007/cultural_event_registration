"""Security utilities: JWT tokens, password hashing, AES-256 Aadhaar encryption."""

import jwt
import os
import base64
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.backends import default_backend
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.config import settings

# ---------- Password Hashing ----------

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


# ---------- JWT Token Management ----------

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create a JWT access token with the given payload."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def verify_access_token(token: str) -> dict:
    """Verify and decode a JWT access token. Raises HTTPException on failure."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


# ---------- JWT Dependency for Protected Routes ----------

security_scheme = HTTPBearer()


def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security_scheme)) -> dict:
    """FastAPI dependency to extract and validate the current admin from JWT."""
    payload = verify_access_token(credentials.credentials)
    if payload.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return payload


# ---------- AES-256 Aadhaar Encryption ----------

def _get_aes_key() -> bytes:
    """Get the 32-byte AES key from settings (hex-encoded)."""
    return bytes.fromhex(settings.AES_ENCRYPTION_KEY)


def encrypt_aadhaar(aadhaar_number: str) -> str:
    """
    Encrypt an Aadhaar number using AES-256-CBC.
    Returns a base64-encoded string containing IV + ciphertext.
    """
    key = _get_aes_key()
    iv = os.urandom(16)

    # PKCS7 padding
    padder = padding.PKCS7(128).padder()
    padded_data = padder.update(aadhaar_number.encode("utf-8")) + padder.finalize()

    # Encrypt
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    ciphertext = encryptor.update(padded_data) + encryptor.finalize()

    # Combine IV + ciphertext and base64 encode
    return base64.b64encode(iv + ciphertext).decode("utf-8")


def decrypt_aadhaar(encrypted_data: str) -> str:
    """
    Decrypt an AES-256-CBC encrypted Aadhaar number.
    Expects a base64-encoded string containing IV + ciphertext.
    """
    key = _get_aes_key()
    raw = base64.b64decode(encrypted_data)

    iv = raw[:16]
    ciphertext = raw[16:]

    # Decrypt
    cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
    decryptor = cipher.decryptor()
    padded_data = decryptor.update(ciphertext) + decryptor.finalize()

    # Remove PKCS7 padding
    unpadder = padding.PKCS7(128).unpadder()
    data = unpadder.update(padded_data) + unpadder.finalize()

    return data.decode("utf-8")
