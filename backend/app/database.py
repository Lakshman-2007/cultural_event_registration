"""Database engine, session, dependency, table creation, and admin seeding."""

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from app.config import settings
from app.models import Base, Admin
from app.security import hash_password


# Create SQLite engine with check_same_thread=False for FastAPI async compatibility
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=settings.DEBUG,
)

# Enable WAL mode and foreign keys for SQLite
if settings.DATABASE_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        cursor.execute("PRAGMA foreign_keys=ON;")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that provides a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables() -> None:
    """Create all database tables if they don't exist."""
    Base.metadata.create_all(bind=engine)
    print("[DB] All tables created successfully.")


def seed_admin() -> None:
    """Seed the default admin account if it doesn't exist."""
    db = SessionLocal()
    try:
        existing = db.query(Admin).filter(Admin.email == settings.DEFAULT_ADMIN_EMAIL).first()
        if existing:
            print(f"[DB] Admin '{settings.DEFAULT_ADMIN_EMAIL}' already exists. Skipping seed.")
            return

        admin = Admin(
            email=settings.DEFAULT_ADMIN_EMAIL,
            password_hash=hash_password(settings.DEFAULT_ADMIN_PASSWORD),
            name=settings.DEFAULT_ADMIN_NAME,
        )
        db.add(admin)
        db.commit()
        print(f"[DB] Default admin seeded: {settings.DEFAULT_ADMIN_EMAIL}")
    except Exception as e:
        db.rollback()
        print(f"[DB] Error seeding admin: {e}")
    finally:
        db.close()
