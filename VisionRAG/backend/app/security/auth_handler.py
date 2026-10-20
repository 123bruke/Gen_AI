"""
Security and Authentication Utilities for VisionRAG.
Handles bcrypt password hashing and cryptographic JSON Web Tokens (JWT) & session tokens.
"""

import datetime
import secrets
from typing import Optional, Dict, Any
import bcrypt
from jose import jwt, JWTError
from app.config import settings

ALGORITHM = "HS256"
DEFAULT_EXPIRE_HOURS = settings.SESSION_EXPIRE_HOURS or 72

def hash_password(password: str) -> str:
    """Hashes a plain password with a secure salt using bcrypt."""
    pw_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(pw_bytes, salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against the stored bcrypt hash."""
    try:
        pw_bytes = plain_password.encode("utf-8")
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pw_bytes, hash_bytes)
    except Exception:
        return False

def generate_session_token() -> str:
    """Generates a secure random 64-character hex session token."""
    return secrets.token_hex(32)

def create_access_token(
    payload: Dict[str, Any],
    expires_delta: Optional[datetime.timedelta] = None
) -> str:
    """Encodes a signed JWT access token containing user claims and expiration timestamp."""
    to_encode = payload.copy()
    if expires_delta:
        expire = datetime.datetime.utcnow() + expires_delta
    else:
        expire = datetime.datetime.utcnow() + datetime.timedelta(hours=DEFAULT_EXPIRE_HOURS)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.datetime.utcnow()
    })
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and cryptographically verifies the JWT token."""
    try:
        decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        return decoded
    except JWTError:
        return None
