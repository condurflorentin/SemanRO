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
    role: str = "user"
    is_active: bool
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Mesaj generic ────────────────────────────────────────────
class MessageResponse(BaseModel):
    message: str


# ══════════════════════════════════════════════════════════════
#  ADMIN SCHEMAS
# ══════════════════════════════════════════════════════════════

# ── Admin: actualizare utilizator ─────────────────────────────
class AdminUserUpdate(BaseModel):
    is_active: bool | None = None
    is_verified: bool | None = None
    role: str | None = Field(None, pattern="^(user|admin)$")


# ── Admin: răspuns cu detalii extinse ─────────────────────────
class AdminUserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Admin: lista paginată ────────────────────────────────────
class PaginatedUsersResponse(BaseModel):
    users: list[AdminUserResponse]
    total: int
    page: int
    per_page: int
    pages: int


# ── Admin: statistici dashboard ──────────────────────────────
class AdminStatsResponse(BaseModel):
    total_users: int
    active_users: int
    verified_users: int
    new_users_today: int
    new_users_this_week: int
    new_users_this_month: int
    recent_users: list[AdminUserResponse]
