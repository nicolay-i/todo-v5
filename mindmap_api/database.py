"""Database utilities for the mind map FastAPI service."""
from __future__ import annotations

import os
from contextlib import contextmanager
from typing import Iterator

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker


load_dotenv()


Base = declarative_base()


def _build_engine() -> Engine:
    database_url = os.getenv(
        "MINDMAP_DATABASE_URL",
        "postgresql+psycopg://postgres:postgres@localhost:5432/mindmap",
    )
    connect_args = {}
    if database_url.startswith("sqlite"):
        # Allow testing with SQLite while keeping code focused on Postgres.
        connect_args["check_same_thread"] = False
    engine = create_engine(database_url, echo=False, future=True, connect_args=connect_args)
    return engine


engine = _build_engine()
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


@contextmanager
def session_scope() -> Iterator[Session]:
    """Provide a transactional scope around a series of operations."""
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def ensure_schema() -> None:
    """Ensure the pgvector extension and database schema exist."""
    from mindmap_api import models  # noqa: F401 - ensure models are registered

    with engine.begin() as connection:
        # pgvector is required for the embedding column.
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
    Base.metadata.create_all(bind=engine)
