"""
Rute de autentificare — Register / Login / Logout / Refresh / Me
──────────────────────────────────────────────────────────────────
• Argon2id hashing
• JWT în HTTP-only Cookie (protecție XSS)
• Rate Limiting pe login (anti brute-force)
"""

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.rate_limiter import limiter
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    set_auth_cookies,
    clear_auth_cookies,
    decode_token,
    get_current_user_id,
)
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, UserResponse, MessageResponse

router = APIRouter(prefix="/api/auth", tags=["Autentificare"])


# ══════════════════════════════════════════════════════════════
#  REGISTER
# ══════════════════════════════════════════════════════════════
@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Înregistrare cont nou",
)
async def register(data: UserRegister, db: AsyncSession = Depends(get_db)):
    # Verifică dacă email-ul există deja
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Adresa de email este deja înregistrată",
        )

    # Creează utilizatorul cu parolă hashată Argon2id
    user = User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    return user


# ══════════════════════════════════════════════════════════════
#  LOGIN  (cu Rate Limiting: 5 încercări / minut)
# ══════════════════════════════════════════════════════════════
@router.post(
    "/login",
    response_model=UserResponse,
    summary="Autentificare cu email și parolă",
)
@limiter.limit("5/minute")
async def login(
    request: Request,
    response: Response,
    data: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    # Caută utilizatorul
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email sau parolă incorectă",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Contul este dezactivat",
        )

    # Generează JWT-uri (include role pentru protecție admin)
    token_data = {"sub": str(user.id), "role": user.role}
    access_token = create_access_token(data=token_data)
    refresh_token = create_refresh_token(data=token_data)

    # Setează cookie-urile HTTP-only (NU localStorage!)
    set_auth_cookies(response, access_token, refresh_token)

    return user


# ══════════════════════════════════════════════════════════════
#  LOGOUT
# ══════════════════════════════════════════════════════════════
@router.post("/logout", response_model=MessageResponse, summary="Deconectare")
async def logout(response: Response):
    clear_auth_cookies(response)
    return {"message": "Deconectat cu succes"}


# ══════════════════════════════════════════════════════════════
#  REFRESH TOKEN
# ══════════════════════════════════════════════════════════════
@router.post("/refresh", response_model=MessageResponse, summary="Reîmprospătare token")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token lipsă",
        )

    payload = decode_token(token, expected_type="refresh")
    user_id = payload.get("sub")
    role = payload.get("role", "user")

    # Generează token nou
    token_data = {"sub": user_id, "role": role}
    new_access = create_access_token(data=token_data)
    new_refresh = create_refresh_token(data=token_data)
    set_auth_cookies(response, new_access, new_refresh)

    return {"message": "Token reîmprospătat cu succes"}


# ══════════════════════════════════════════════════════════════
#  GET CURRENT USER  (rută protejată)
# ══════════════════════════════════════════════════════════════
@router.get(
    "/me",
    response_model=UserResponse,
    summary="Obține profilul utilizatorului autentificat",
)
async def get_me(
    user_id: int = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilizatorul nu a fost găsit",
        )
    return user
