"""
Inițializare bază de date — creează tabelele dacă nu există.
"""

from app.db.database import engine, Base


async def init_db():
    async with engine.begin() as conn:
        # Importă toate modelele pentru ca Base.metadata să le cunoască
        import app.models.user  # noqa: F401
        await conn.run_sync(Base.metadata.create_all)
