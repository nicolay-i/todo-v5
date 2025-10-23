"""Database helpers for the mind map FastAPI service."""
from __future__ import annotations

from typing import Iterable, List
from uuid import UUID, uuid4

from sqlalchemy import delete, not_, select
from sqlalchemy.ext.asyncio import AsyncSession

from .models import MindMapEdge, MindMapLog, MindMapNode
from .schemas import (
    EdgeCreate,
    EdgeOut,
    LogCreate,
    LogOut,
    MindMapResponse,
    MindMapUpsert,
    NodeCreate,
    NodeOut,
)


async def _load_nodes(session: AsyncSession) -> List[MindMapNode]:
    result = await session.execute(select(MindMapNode).order_by(MindMapNode.created_at))
    return list(result.scalars().all())


async def _load_edges(session: AsyncSession) -> List[MindMapEdge]:
    result = await session.execute(select(MindMapEdge).order_by(MindMapEdge.created_at))
    return list(result.scalars().all())


async def _load_logs(session: AsyncSession, limit: int | None = None) -> List[MindMapLog]:
    stmt = select(MindMapLog).order_by(MindMapLog.created_at.desc())
    if limit is not None:
        stmt = stmt.limit(limit)
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def get_recent_logs(session: AsyncSession, limit: int = 50) -> List[LogOut]:
    logs = await _load_logs(session, limit)
    return [LogOut.model_validate(log) for log in logs]


async def get_mind_map(session: AsyncSession) -> MindMapResponse:
    nodes = await _load_nodes(session)
    edges = await _load_edges(session)
    logs = await _load_logs(session, limit=50)
    return MindMapResponse(
        nodes=[NodeOut.model_validate(node) for node in nodes],
        edges=[EdgeOut.model_validate(edge) for edge in edges],
        logs=[LogOut.model_validate(log) for log in logs],
    )


async def _upsert_node(session: AsyncSession, data: NodeCreate) -> MindMapNode:
    node_id = data.id or uuid4()
    existing = await session.get(MindMapNode, node_id)
    if existing:
        existing.title = data.title
        existing.content = data.content
        existing.embedding = data.embedding
        return existing
    node = MindMapNode(
        id=node_id,
        title=data.title,
        content=data.content,
        embedding=data.embedding,
    )
    session.add(node)
    return node


async def _replace_edges(session: AsyncSession, edges: Iterable[EdgeCreate]) -> None:
    await session.execute(delete(MindMapEdge))
    for edge in edges:
        session.add(
            MindMapEdge(
                source_id=edge.source_id,
                target_id=edge.target_id,
                label=edge.label,
            )
        )


async def _sync_nodes(session: AsyncSession, nodes: List[NodeCreate]) -> List[MindMapNode]:
    seen_ids: set[UUID] = set()
    persisted: List[MindMapNode] = []

    for node_data in nodes:
        node = await _upsert_node(session, node_data)
        seen_ids.add(node.id)
        persisted.append(node)

    if seen_ids:
        await session.execute(
            delete(MindMapNode).where(not_(MindMapNode.id.in_(seen_ids)))
        )
    else:
        await session.execute(delete(MindMapNode))

    return persisted


async def _create_logs(session: AsyncSession, entries: Iterable[LogCreate]) -> None:
    for entry in entries:
        session.add(
            MindMapLog(
                level=entry.level,
                message=entry.message,
                metadata=entry.metadata,
            )
        )


async def upsert_mind_map(session: AsyncSession, payload: MindMapUpsert) -> MindMapResponse:
    persisted_nodes = await _sync_nodes(session, payload.nodes)
    await _replace_edges(session, payload.edges)
    await _create_logs(session, payload.logs)

    # Create an automatic log entry describing the update
    session.add(
        MindMapLog(
            level="info",
            message=f"Mind map synchronised with {len(persisted_nodes)} nodes and {len(payload.edges)} edges.",
            metadata={
                "node_ids": [str(node.id) for node in persisted_nodes],
                "edge_count": len(payload.edges),
            },
        )
    )

    await session.commit()

    return await get_mind_map(session)
