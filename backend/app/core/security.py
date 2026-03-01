"""
Modul de securitate 2025-2026
─────────────────────────────
• Argon2id pentru hashing parole (câștigător PHC – rezistent GPU/ASIC)
• JWT (HS256) stocat în HTTP-only Cookie (imun XSS)
• Funcții helper pentru creare / verificare token + cookie
"""

from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import Request, Response, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext

from app.core.config import get_settings

settings = get_settings()

# ── Argon2id hashing ──────────────────────────────────────────
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# OAuth2 scheme (folosit doar ca dependință, token-ul vine din cookie)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


# ── Parole ────────────────────────────────────────────────────
def hash_password(password: str) -> str:
    """Hashează parola cu Argon2id."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifică parola plain-text față de hash-ul Argon2id."""
    return pwd_context.verify(plain_password, hashed_password)


# ── JWT Access Token ──────────────────────────────────────────
def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict[str, Any]) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


# ── Cookie Helpers ────────────────────────────────────────────
def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    """Setează JWT-urile în HTTP-only, Secure, SameSite cookies."""
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
        domain=settings.COOKIE_DOMAIN,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/api/auth/refresh",
        domain=settings.COOKIE_DOMAIN,
    )


def clear_auth_cookies(response: Response) -> None:
    """Șterge cookie-urile de autentificare la logout."""
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/api/auth/refresh")


# ── Decodare Token ────────────────────────────────────────────
def decode_token(token: str, expected_type: str = "access") -> dict:
    """Decodează și validează un JWT."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != expected_type:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Tip de token invalid",
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalid sau expirat",
        )


# ── Dependință: Extrage user-ul curent din cookie ────────────
async def get_current_user_id(request: Request) -> int:
    """
    Dependință FastAPI — extrage user_id din cookie-ul HTTP-only.
    Nu folosește localStorage sau header Authorization (protecție XSS).
    """
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nu ești autentificat",
        )
    payload = decode_token(token, expected_type="access")
    user_id: int | None = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalid",
        )
    return int(user_id)
