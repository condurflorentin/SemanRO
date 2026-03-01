"""
FastAPI Application — Entry Point
──────────────────────────────────
• CORS strict (doar frontend-ul)
• Rate Limiting middleware (SlowAPI)
• Lifecycle: crează tabelele DB la startup
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import get_settings
from app.core.rate_limiter import limiter
from app.db.init_db import init_db


settings = get_settings()


# ── Lifecycle (startup / shutdown) ────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # STARTUP — creează tabelele dacă nu există
    await init_db()
    print("Baza de date inițializată cu succes")
    yield
    # SHUTDOWN
    print("Aplicația se oprește")


# ── Instanță FastAPI ──────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── Rate Limiter ──────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS — acceptă cereri DOAR de pe frontend ────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,  # Necesar pentru cookies
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# ── Înregistrare Rute ─────────────────────────────────────────
from app.api.auth import router as auth_router    # noqa: E402
from app.api.users import router as users_router  # noqa: E402
from app.api.admin import router as admin_router  # noqa: E402

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(admin_router)


# ── Health Check ──────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "ok", "version": settings.APP_VERSION}
