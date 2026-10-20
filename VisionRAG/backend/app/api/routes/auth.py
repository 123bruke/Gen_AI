"""
Authentication and Session API Endpoints.
Handles:
- User Registration (stores in PostgreSQL with metadata JSON)
- User Login (authenticates, issues JWT, logs login time and session in DB)
- Current User Profile verification (/api/auth/me)
- User Profile and Metadata update (/api/auth/profile)
- User Logout (updates logout time, calculates duration in DB)
- Sessions listing (login/logout audit trail)
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Request, Header, Depends
from pydantic import BaseModel, EmailStr
from app.services.user_service import user_service

router = APIRouter(prefix="/api/auth", tags=["Authentication & User Management"])

class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str
    metadata: Optional[Dict[str, Any]] = None

class LoginRequest(BaseModel):
    email: str
    password: str
    metadata: Optional[Dict[str, Any]] = None

class LogoutRequest(BaseModel):
    token: Optional[str] = None
    user_id: Optional[str] = None

class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    avatar: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

def get_token_from_header(authorization: Optional[str] = Header(None)) -> Optional[str]:
    if not authorization:
        return None
    if authorization.startswith("Bearer "):
        return authorization[7:].strip()
    return authorization.strip()

@router.post("/register")
def register_endpoint(req: RegisterRequest, request: Request):
    """
    Registers a new user account, saves user details in PostgreSQL,
    initializes session, generates JWT token, and logs account creation.
    """
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")
    if not req.full_name.strip():
        raise HTTPException(status_code=400, detail="Full name is required.")

    client_ip = request.client.host if request.client else None
    try:
        result = user_service.register_user(
            full_name=req.full_name,
            email=req.email,
            password=req.password,
            ip_address=client_ip,
            metadata=req.metadata
        )
        return result
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(err)}")

@router.post("/login")
def login_endpoint(req: LoginRequest, request: Request):
    """
    Authenticates user against PostgreSQL, creates active session in DB,
    issues JWT token, and records login progress.
    """
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    try:
        result = user_service.login_user(
            email=req.email,
            password=req.password,
            ip_address=client_ip,
            user_agent=user_agent,
            metadata=req.metadata
        )
        return result
    except ValueError as val_err:
        raise HTTPException(status_code=401, detail=str(val_err))
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(err)}")

@router.get("/me")
def get_current_user_endpoint(token: Optional[str] = Depends(get_token_from_header)):
    """
    Returns the currently authenticated user profile and metadata from PostgreSQL.
    """
    if not token:
        raise HTTPException(status_code=401, detail="Authentication token required.")
    
    user = user_service.get_current_user_from_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
    
    return {
        "authenticated": True,
        "user": user
    }

@router.post("/logout")
def logout_endpoint(
    req: LogoutRequest,
    token: Optional[str] = Depends(get_token_from_header)
):
    """
    Logs out user, updates the logout timestamp in PostgreSQL, computes session duration,
    and logs the logout progress event.
    """
    active_token = req.token or token

    if not active_token and not req.user_id:
        raise HTTPException(status_code=400, detail="Token or user_id required for logout.")

    try:
        result = user_service.logout_user(token=active_token, user_id=req.user_id)
        return result
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Logout failed: {str(err)}")

@router.get("/sessions")
def list_sessions_endpoint(user_id: Optional[str] = None):
    """
    Returns login and logout history along with session duration recorded in PostgreSQL.
    """
    sessions = user_service.list_user_sessions(user_id=user_id, limit=50)
    return {
        "count": len(sessions),
        "sessions": sessions
    }
