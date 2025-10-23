"""Pydantic models for the mind map API."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


VECTOR_DIMENSION = 3


class NodeBase(BaseModel):
    title: str = Field(..., max_length=255)
    content: Optional[str] = None
    embedding: List[float] = Field(
        ...,
        min_length=VECTOR_DIMENSION,
        max_length=VECTOR_DIMENSION,
        description="Embedding stored in the pgvector column.",
    )

    @field_validator("embedding")
    @classmethod
    def validate_embedding_length(cls, value: List[float]) -> List[float]:
        if len(value) != VECTOR_DIMENSION:
            raise ValueError(f"Embedding must contain {VECTOR_DIMENSION} floats.")
        return value


class NodeCreate(NodeBase):
    id: Optional[UUID] = None


class NodeOut(NodeBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class EdgeBase(BaseModel):
    source_id: UUID
    target_id: UUID
    label: Optional[str] = Field(default=None, max_length=255)


class EdgeCreate(EdgeBase):
    pass


class EdgeOut(EdgeBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class LogCreate(BaseModel):
    level: str = Field(default="info", max_length=32)
    message: str = Field(..., min_length=1)
    metadata: Dict[str, Any] | None = None


class LogOut(LogCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }


class MindMapUpsert(BaseModel):
    nodes: List[NodeCreate]
    edges: List[EdgeCreate]
    logs: List[LogCreate] = Field(default_factory=list)


class MindMapResponse(BaseModel):
    nodes: List[NodeOut]
    edges: List[EdgeOut]
    logs: List[LogOut]
