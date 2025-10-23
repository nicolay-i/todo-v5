"""Database configuration for the FastAPI mind map service."""
from __future__ import annotations

import os
from typing import AsyncGenerator

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

load_dotenv()

DATABASE_URL_ENV_KEYS = (
    "MINDMAP_DATABASE_URL",
    "DATABASE_URL",
)


def _get_database_url() -> str:
    for key in DATABASE_URL_ENV_KEYS:
        value = os.getenv(key)
        if value:
            return value
    raise RuntimeError(
        "Database URL is not configured. Set MINDMAP_DATABASE_URL or DATABASE_URL."
    )


def _build_async_url(raw_url: str) -> str:
    if raw_url.startswith("postgresql+asyncpg://"):
        return raw_url
    if raw_url.startswith("postgresql://"):
        return raw_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    if raw_url.startswith("postgres://"):
        return raw_url.replace("postgres://", "postgresql+asyncpg://", 1)
    raise ValueError(
        "Unsupported database URL. Use a PostgreSQL connection string, e.g. postgresql://user:pass@host/db."
    )


DATABASE_URL = _build_async_url(_get_database_url())


class Base(DeclarativeBase):
    """Base class for ORM models."""


engine = create_async_engine(
    DATABASE_URL,
    future=True,
    echo=os.getenv("SQL_ECHO", "").lower() in {"1", "true", "yes"},
)

AsyncSessionMaker = async_sessionmaker(engine, expire_on_commit=False)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency that provides a database session."""
    async with AsyncSessionMaker() as session:
        yield session


async def init_db() -> None:
    """Initialise the database schema and ensure pgvector is available."""
    from sqlalchemy import text

    # Import models so they are registered with SQLAlchemy's metadata
    from . import models  # noqa: F401  # pylint: disable=unused-import

    async with engine.begin() as conn:
        await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "vector";'))
        await conn.run_sync(Base.metadata.create_all)
