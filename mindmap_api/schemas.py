"""Pydantic schemas for the mind map API."""
from __future__ import annotations

from datetime import datetime
from typing import Any, List
from uuid import UUID

from pydantic import BaseModel, Field


class MindMapNodePosition(BaseModel):
    x: float | None = Field(default=None, description="Canvas X coordinate")
    y: float | None = Field(default=None, description="Canvas Y coordinate")


class MindMapNodeCreate(BaseModel):
    key: str = Field(..., description="Stable node identifier used when creating edges")
    title: str
    content: str | None = None
    position: MindMapNodePosition | None = None
    embedding: List[float] | None = Field(
        default=None, description="Optional embedding vector for the node"
    )


class MindMapEdgeCreate(BaseModel):
    source_key: str = Field(..., description="Key of the parent/source node")
    target_key: str = Field(..., description="Key of the child/target node")
    relationship: str | None = Field(
        default=None, description="Optional label describing the relationship"
    )


class MindMapLogCreate(BaseModel):
    message: str
    level: str = Field(default="info")
    metadata: dict[str, Any] | None = None


class MindMapCreate(BaseModel):
    title: str
    description: str | None = None
    nodes: list[MindMapNodeCreate]
    edges: list[MindMapEdgeCreate]
    logs: list[MindMapLogCreate] | None = None


class MindMapSummary(BaseModel):
    id: UUID
    title: str
    description: str | None = None
    node_count: int
    edge_count: int
    created_at: datetime
    updated_at: datetime

    model_config = dict(from_attributes=True)


class MindMapNode(BaseModel):
    id: UUID
    key: str
    title: str
    content: str | None = None
    position: MindMapNodePosition
    embedding: List[float]
    created_at: datetime


class MindMapEdge(BaseModel):
    id: UUID
    source_node_id: UUID
    target_node_id: UUID
    relationship: str | None = None


class MindMapLog(BaseModel):
    id: UUID
    level: str
    message: str
    metadata: dict[str, Any] | None
    created_at: datetime


class MindMapDetail(BaseModel):
    id: UUID
    title: str
    description: str | None
    created_at: datetime
    updated_at: datetime
    nodes: list[MindMapNode]
    edges: list[MindMapEdge]
    logs: list[MindMapLog]


class MindMapLogResponse(BaseModel):
    id: UUID
    mind_map_id: UUID
    level: str
    message: str
    metadata: dict[str, Any] | None
    created_at: datetime
