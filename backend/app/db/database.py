"""
Conexiune asincronă la PostgreSQL cu SQLAlchemy 2.0+
────────────────────────────────────────────────────
Folosește asyncpg ca driver async (non-blocking I/O).
"""

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings

settings = get_settings()

# ── Engine async ──────────────────────────────────────────────
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=20,
    max_overflow=10,
)

# ── Session factory ───────────────────────────────────────────
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ── Base declarativă ─────────────────────────────────────────
class Base(DeclarativeBase):
    pass


# ── Dependință FastAPI: oferă o sesiune DB per request ────────
async def get_db() -> AsyncSession:
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
