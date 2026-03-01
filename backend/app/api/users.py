"""
Rute protejate pentru utilizatori autentificați.
"""

from fastapi import APIRouter, Depends
from app.core.security import get_current_user_id

router = APIRouter(prefix="/api/users", tags=["Utilizatori"])


@router.get("/dashboard")
async def dashboard(user_id: int = Depends(get_current_user_id)):
    """Exemplu de rută protejată — doar utilizatori autentificați."""
    return {
        "message": f"Bine ai venit pe dashboard, utilizator #{user_id}!",
        "user_id": user_id,
    }
