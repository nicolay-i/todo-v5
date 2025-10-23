"""SQLAlchemy models for the mind map domain."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from pgvector.sqlalchemy import Vector
from sqlalchemy import JSON, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


class TimestampMixin:
    """Reusable timestamp columns."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class MindMapNode(TimestampMixin, Base):
    """Node that represents a topic in the mind map."""

    __tablename__ = "mind_map_nodes"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(255))
    content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    embedding: Mapped[list[float]] = mapped_column(Vector(3))


class MindMapEdge(TimestampMixin, Base):
    """Directed link between two nodes in the mind map."""

    __tablename__ = "mind_map_edges"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    source_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("mind_map_nodes.id", ondelete="CASCADE")
    )
    target_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("mind_map_nodes.id", ondelete="CASCADE")
    )
    label: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)


class MindMapLog(TimestampMixin, Base):
    """Audit trail for mind map creation and updates."""

    __tablename__ = "mind_map_logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    level: Mapped[str] = mapped_column(String(32), default="info")
    message: Mapped[str] = mapped_column(Text)
    metadata: Mapped[dict | None] = mapped_column(JSON, default=None)
