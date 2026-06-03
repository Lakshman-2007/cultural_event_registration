"""Main entry point for the FastAPI application."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import create_tables, seed_admin
from app.routes import registration, payment, admin, qr, attendance


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events for the FastAPI application."""
    # Run startup events
    create_tables()
    seed_admin()
    yield
    # Run shutdown events (none needed for now)


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, restrict to allowed origins (e.g. Vercel deployment URL)
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
)

# Register routers
app.include_router(registration.router)
app.include_router(payment.router)
app.include_router(admin.router)
app.include_router(qr.router)
app.include_router(attendance.router)


@app.get("/")
def read_root():
    """Root health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION
    }
