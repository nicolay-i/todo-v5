"""FastAPI entrypoint exposing mind map data backed by PostgreSQL."""
from __future__ import annotations

from typing import Generator, Iterable
from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from mindmap_api.database import SessionLocal, ensure_schema, session_scope
from mindmap_api.embeddings import deterministic_embedding
from mindmap_api import models
from mindmap_api import schemas


app = FastAPI(title="Mind Map Service", version="1.0.0")


def get_session() -> Generator[Session, None, None]:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@app.on_event("startup")
def startup() -> None:
    ensure_schema()
    _bootstrap_sample_data()


def _bootstrap_sample_data() -> None:
    """Create a default mind map if the database is empty."""
    with session_scope() as session:
        existing = session.execute(select(func.count(models.MindMap.id))).scalar_one()
        if existing:
            return

        mind_map = models.MindMap(
            title="Онбординг нового разработчика",
            description=(
                "Стартовая майнд-карта с ключевыми шагами адаптации сотрудника."
            ),
        )
        session.add(mind_map)
        session.flush()

        nodes = [
            models.MindMapNode(
                mind_map_id=mind_map.id,
                key="welcome",
                title="Приветствие",
                content="Встреча с тимлидом и обзор проекта",
                position_x=0,
                position_y=0,
                embedding=deterministic_embedding("Приветствие", "тимлид"),
            ),
            models.MindMapNode(
                mind_map_id=mind_map.id,
                key="access",
                title="Доступы",
                content="Создание аккаунтов, настройка VPN и репозиториев",
                position_x=1,
                position_y=0.5,
                embedding=deterministic_embedding("Доступы", "VPN"),
            ),
            models.MindMapNode(
                mind_map_id=mind_map.id,
                key="stack",
                title="Изучение стека",
                content="Документация, код-ревью, стандартные практики",
                position_x=2,
                position_y=0.2,
                embedding=deterministic_embedding("стек", "документация"),
            ),
            models.MindMapNode(
                mind_map_id=mind_map.id,
                key="first-task",
                title="Первая задача",
                content="Небольшой тикет для погружения",
                position_x=3,
                position_y=0.5,
                embedding=deterministic_embedding("первая", "задача"),
            ),
        ]

        for node in nodes:
            session.add(node)
        session.flush()
        node_index = {node.key: node.id for node in nodes}

        edges = [
            models.MindMapEdge(
                mind_map_id=mind_map.id,
                source_node_id=node_index["welcome"],
                target_node_id=node_index["access"],
                relationship="подготовка",
            ),
            models.MindMapEdge(
                mind_map_id=mind_map.id,
                source_node_id=node_index["access"],
                target_node_id=node_index["stack"],
                relationship="развитие",
            ),
            models.MindMapEdge(
                mind_map_id=mind_map.id,
                source_node_id=node_index["stack"],
                target_node_id=node_index["first-task"],
                relationship="применение",
            ),
        ]

        for edge in edges:
            session.add(edge)

        session.add(
            models.MindMapLog(
                mind_map_id=mind_map.id,
                level="info",
                message="Автоматически созданная майнд-карта для демонстрации",
                metadata={"source": "bootstrap"},
            )
        )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/mindmaps", response_model=list[schemas.MindMapSummary])
def list_mindmaps(session: Session = Depends(get_session)) -> list[schemas.MindMapSummary]:
    mind_maps = (
        session.execute(
            select(models.MindMap)
            .options(
                selectinload(models.MindMap.nodes),
                selectinload(models.MindMap.edges),
            )
            .order_by(models.MindMap.created_at.desc())
        )
        .scalars()
        .all()
    )
    return [
        schemas.MindMapSummary(
            id=item.id,
            title=item.title,
            description=item.description,
            node_count=len(item.nodes),
            edge_count=len(item.edges),
            created_at=item.created_at,
            updated_at=item.updated_at,
        )
        for item in mind_maps
    ]


@app.get("/mindmaps/{mind_map_id}", response_model=schemas.MindMapDetail)
def get_mindmap(mind_map_id: UUID, session: Session = Depends(get_session)) -> schemas.MindMapDetail:
    mind_map = _load_mind_map(session, mind_map_id)
    if mind_map is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mind map not found")
    return _serialize_mind_map(mind_map)


@app.post("/mindmaps", response_model=schemas.MindMapDetail, status_code=status.HTTP_201_CREATED)
def create_mindmap(
    payload: schemas.MindMapCreate,
    session: Session = Depends(get_session),
) -> schemas.MindMapDetail:
    mind_map = models.MindMap(title=payload.title, description=payload.description)
    session.add(mind_map)
    session.flush()

    node_index: dict[str, models.MindMapNode] = {}

    try:
        for node_in in payload.nodes:
            embedding = node_in.embedding or deterministic_embedding(node_in.title, node_in.content)
            node = models.MindMapNode(
                mind_map_id=mind_map.id,
                key=node_in.key,
                title=node_in.title,
                content=node_in.content,
                position_x=node_in.position.x if node_in.position else None,
                position_y=node_in.position.y if node_in.position else None,
                embedding=embedding,
            )
            session.add(node)
            session.flush()
            node_index[node_in.key] = node

        for edge_in in payload.edges:
            try:
                source = node_index[edge_in.source_key]
                target = node_index[edge_in.target_key]
            except KeyError as exc:  # pragma: no cover - defensive branch
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Unknown node reference: {exc.args[0]}",
                ) from exc
            session.add(
                models.MindMapEdge(
                    mind_map_id=mind_map.id,
                    source_node_id=source.id,
                    target_node_id=target.id,
                    relationship=edge_in.relationship,
                )
            )

        logs: Iterable[schemas.MindMapLogCreate]
        if payload.logs:
            logs = payload.logs
        else:
            logs = [
                schemas.MindMapLogCreate(
                    level="info",
                    message="Mind map created",
                    metadata={"auto": True},
                )
            ]

        for log_in in logs:
            session.add(
                models.MindMapLog(
                    mind_map_id=mind_map.id,
                    level=log_in.level,
                    message=log_in.message,
                    metadata=log_in.metadata,
                )
            )
        session.commit()
    except IntegrityError as exc:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mind map contains duplicate keys or invalid references",
        ) from exc

    reloaded = _load_mind_map(session, mind_map.id)
    if reloaded is None:  # pragma: no cover - created object must exist
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to load mind map")
    return _serialize_mind_map(reloaded)


@app.post(
    "/mindmaps/{mind_map_id}/logs",
    response_model=schemas.MindMapLogResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_log(
    mind_map_id: UUID,
    payload: schemas.MindMapLogCreate,
    session: Session = Depends(get_session),
) -> schemas.MindMapLogResponse:
    mind_map = session.get(models.MindMap, mind_map_id)
    if mind_map is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mind map not found")

    log = models.MindMapLog(
        mind_map_id=mind_map.id,
        level=payload.level,
        message=payload.message,
        metadata=payload.metadata,
    )
    session.add(log)
    session.commit()
    session.refresh(log)
    return schemas.MindMapLogResponse(
        id=log.id,
        mind_map_id=log.mind_map_id,
        level=log.level,
        message=log.message,
        metadata=log.metadata,
        created_at=log.created_at,
    )


def _load_mind_map(session: Session, mind_map_id: UUID) -> models.MindMap | None:
    return (
        session.execute(
            select(models.MindMap)
            .options(
                selectinload(models.MindMap.nodes),
                selectinload(models.MindMap.edges),
                selectinload(models.MindMap.logs),
            )
            .where(models.MindMap.id == mind_map_id)
        )
        .scalars()
        .first()
    )


def _serialize_mind_map(mind_map: models.MindMap) -> schemas.MindMapDetail:
    return schemas.MindMapDetail(
        id=mind_map.id,
        title=mind_map.title,
        description=mind_map.description,
        created_at=mind_map.created_at,
        updated_at=mind_map.updated_at,
        nodes=[
            schemas.MindMapNode(
                id=node.id,
                key=node.key,
                title=node.title,
                content=node.content,
                position=schemas.MindMapNodePosition(x=node.position_x, y=node.position_y),
                embedding=list(node.embedding or []),
                created_at=node.created_at,
            )
            for node in mind_map.nodes
        ],
        edges=[
            schemas.MindMapEdge(
                id=edge.id,
                source_node_id=edge.source_node_id,
                target_node_id=edge.target_node_id,
                relationship=edge.relationship,
            )
            for edge in mind_map.edges
        ],
        logs=[
            schemas.MindMapLog(
                id=log.id,
                level=log.level,
                message=log.message,
                metadata=log.metadata,
                created_at=log.created_at,
            )
            for log in sorted(mind_map.logs, key=lambda item: item.created_at)
        ],
    )
