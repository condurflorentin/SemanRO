"""
Pydantic V2 Schemas pentru User
────────────────────────────────
Validare strictă: EmailStr, constr cu lungime minimă, etc.
"""

from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


# ── Înregistrare ──────────────────────────────────────────────
class UserRegister(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=150, examples=["Ion Popescu"])
    password: str = Field(..., min_length=8, max_length=128, examples=["Parola123!"])


# ── Autentificare (Login) ────────────────────────────────────
class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


# ── Răspuns public (fără parolă) ─────────────────────────────
class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Mesaj generic ────────────────────────────────────────────
class MessageResponse(BaseModel):
    message: str
