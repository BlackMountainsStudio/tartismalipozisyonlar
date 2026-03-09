import os
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from .base import Base


DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/var_odasi")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=Session)


def init_db() -> None:
    """Create all tables in the database.

    In production, prefer Alembic migrations instead of this helper.
    """

    Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

