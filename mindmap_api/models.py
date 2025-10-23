"""SQLAlchemy models for the mind map domain."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from pgvector.sqlalchemy import Vector
from sqlalchemy import JSON, Column, DateTime, Float, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from mindmap_api.database import Base


VECTOR_DIMENSION = 8


class MindMap(Base):
    __tablename__ = "mind_maps"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    nodes: Mapped[list["MindMapNode"]] = relationship(
        "MindMapNode", back_populates="mind_map", cascade="all, delete-orphan"
    )
    edges: Mapped[list["MindMapEdge"]] = relationship(
        "MindMapEdge", back_populates="mind_map", cascade="all, delete-orphan"
    )
    logs: Mapped[list["MindMapLog"]] = relationship(
        "MindMapLog", back_populates="mind_map", cascade="all, delete-orphan"
    )


class MindMapNode(Base):
    __tablename__ = "mind_map_nodes"
    __table_args__ = (
        UniqueConstraint("mind_map_id", "key", name="uq_node_key_per_map"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    mind_map_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("mind_maps.id", ondelete="CASCADE"), nullable=False
    )
    key: Mapped[str] = mapped_column(String(64), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    position_x: Mapped[float | None] = mapped_column(Float, nullable=True)
    position_y: Mapped[float | None] = mapped_column(Float, nullable=True)
    embedding: Mapped[list[float]] = mapped_column(
        Vector(VECTOR_DIMENSION), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    mind_map: Mapped[MindMap] = relationship("MindMap", back_populates="nodes")
    outgoing_edges: Mapped[list["MindMapEdge"]] = relationship(
        "MindMapEdge", back_populates="source", foreign_keys="MindMapEdge.source_node_id"
    )
    incoming_edges: Mapped[list["MindMapEdge"]] = relationship(
        "MindMapEdge", back_populates="target", foreign_keys="MindMapEdge.target_node_id"
    )


class MindMapEdge(Base):
    __tablename__ = "mind_map_edges"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    mind_map_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("mind_maps.id", ondelete="CASCADE"), nullable=False
    )
    source_node_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("mind_map_nodes.id", ondelete="CASCADE"), nullable=False
    )
    target_node_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("mind_map_nodes.id", ondelete="CASCADE"), nullable=False
    )
    relationship: Mapped[str | None] = mapped_column(String(255), nullable=True)

    mind_map: Mapped[MindMap] = relationship("MindMap", back_populates="edges")
    source: Mapped[MindMapNode] = relationship(
        "MindMapNode", foreign_keys=[source_node_id], back_populates="outgoing_edges"
    )
    target: Mapped[MindMapNode] = relationship(
        "MindMapNode", foreign_keys=[target_node_id], back_populates="incoming_edges"
    )


class MindMapLog(Base):
    __tablename__ = "mind_map_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    mind_map_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("mind_maps.id", ondelete="CASCADE"), nullable=False
    )
    level: Mapped[str] = mapped_column(String(32), default="info")
    message: Mapped[str] = mapped_column(Text, nullable=False)
    metadata = Column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    mind_map: Mapped[MindMap] = relationship("MindMap", back_populates="logs")
