"""
Rute Admin — Gestionare utilizatori + Statistici + Loguri
──────────────────────────────────────────────────────────
Toate rutele sunt protejate cu require_admin.
"""

from datetime import datetime, timedelta, timezone
from math import ceil

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import require_admin
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import (
    AdminUserResponse,
    AdminUserUpdate,
    AdminStatsResponse,
    MessageResponse,
    PaginatedUsersResponse,
)

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# ══════════════════════════════════════════════════════════════
#  DASHBOARD STATISTICS
# ══════════════════════════════════════════════════════════════
@router.get(
    "/stats",
    response_model=AdminStatsResponse,
    summary="Statistici generale pentru dashboard",
)
async def get_stats(
    admin_id: int = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=now.weekday())
    month_start = today_start.replace(day=1)

    # Queries paralele
    total = await db.scalar(select(func.count(User.id)))
    active = await db.scalar(select(func.count(User.id)).where(User.is_active == True))
    verified = await db.scalar(select(func.count(User.id)).where(User.is_verified == True))
    new_today = await db.scalar(
        select(func.count(User.id)).where(User.created_at >= today_start)
    )
    new_week = await db.scalar(
        select(func.count(User.id)).where(User.created_at >= week_start)
    )
    new_month = await db.scalar(
        select(func.count(User.id)).where(User.created_at >= month_start)
    )

    # Ultimii 5 utilizatori
    result = await db.execute(
        select(User).order_by(User.created_at.desc()).limit(5)
    )
    recent = result.scalars().all()

    return AdminStatsResponse(
        total_users=total or 0,
        active_users=active or 0,
        verified_users=verified or 0,
        new_users_today=new_today or 0,
        new_users_this_week=new_week or 0,
        new_users_this_month=new_month or 0,
        recent_users=recent,
    )


# ══════════════════════════════════════════════════════════════
#  LIST ALL USERS (cu paginare + filtre + search)
# ══════════════════════════════════════════════════════════════
@router.get(
    "/users",
    response_model=PaginatedUsersResponse,
    summary="Lista utilizatori (paginata, cu filtre)",
)
async def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    search: str = Query(None, max_length=200),
    status_filter: str = Query(None, pattern="^(active|inactive|verified|unverified)$"),
    role_filter: str = Query(None, pattern="^(user|admin)$"),
    admin_id: int = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    # Baza query
    query = select(User)
    count_query = select(func.count(User.id))

    # Filtre
    conditions = []
    if search:
        search_pattern = f"%{search}%"
        conditions.append(
            (User.email.ilike(search_pattern)) | (User.full_name.ilike(search_pattern))
        )
    if status_filter == "active":
        conditions.append(User.is_active == True)
    elif status_filter == "inactive":
        conditions.append(User.is_active == False)
    elif status_filter == "verified":
        conditions.append(User.is_verified == True)
    elif status_filter == "unverified":
        conditions.append(User.is_verified == False)
    if role_filter:
        conditions.append(User.role == role_filter)

    if conditions:
        combined = and_(*conditions)
        query = query.where(combined)
        count_query = count_query.where(combined)

    # Total
    total = await db.scalar(count_query) or 0
    pages = ceil(total / per_page) if total > 0 else 1

    # Paginare
    offset = (page - 1) * per_page
    result = await db.execute(
        query.order_by(User.created_at.desc()).offset(offset).limit(per_page)
    )
    users = result.scalars().all()

    return PaginatedUsersResponse(
        users=users,
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
    )


# ══════════════════════════════════════════════════════════════
#  GET SINGLE USER
# ══════════════════════════════════════════════════════════════
@router.get(
    "/users/{user_id}",
    response_model=AdminUserResponse,
    summary="Detalii utilizator",
)
async def get_user(
    user_id: int,
    admin_id: int = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Utilizatorul nu a fost gasit")
    return user


# ══════════════════════════════════════════════════════════════
#  UPDATE USER (activare/dezactivare/verificare/schimbare rol)
# ══════════════════════════════════════════════════════════════
@router.patch(
    "/users/{user_id}",
    response_model=AdminUserResponse,
    summary="Actualizeaza utilizator (status, rol, verificare)",
)
async def update_user(
    user_id: int,
    data: AdminUserUpdate,
    admin_id: int = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Utilizatorul nu a fost gasit")

    # Nu permite admin-ului sa se dezactiveze pe el insusi
    if user.id == admin_id and data.is_active is False:
        raise HTTPException(
            status_code=400,
            detail="Nu te poti dezactiva pe tine insuti",
        )

    # Nu permite stergerea rolului de admin al propriului cont
    if user.id == admin_id and data.role == "user":
        raise HTTPException(
            status_code=400,
            detail="Nu iti poti sterge propriul rol de admin",
        )

    # Aplica modificarile
    if data.is_active is not None:
        user.is_active = data.is_active
    if data.is_verified is not None:
        user.is_verified = data.is_verified
    if data.role is not None:
        user.role = data.role

    await db.flush()
    await db.refresh(user)
    return user


# ══════════════════════════════════════════════════════════════
#  DELETE USER
# ══════════════════════════════════════════════════════════════
@router.delete(
    "/users/{user_id}",
    response_model=MessageResponse,
    summary="Sterge un utilizator",
)
async def delete_user(
    user_id: int,
    admin_id: int = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if user_id == admin_id:
        raise HTTPException(
            status_code=400,
            detail="Nu iti poti sterge propriul cont de admin",
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Utilizatorul nu a fost gasit")

    await db.delete(user)
    return {"message": f"Utilizatorul {user.email} a fost sters"}
