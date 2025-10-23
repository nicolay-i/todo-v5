"""FastAPI application that exposes mind map data stored in PostgreSQL."""
from __future__ import annotations

from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.ext.asyncio import AsyncSession

from . import crud
from .db import get_session, init_db
from .schemas import LogOut, MindMapResponse, MindMapUpsert

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(title="Mind Map Viewer", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))


@app.on_event("startup")
async def startup_event() -> None:
    await init_db()


@app.get("/", response_class=HTMLResponse)
async def render_mind_map(
    request: Request,
    session: AsyncSession = Depends(get_session),
) -> HTMLResponse:
    logs = await crud.get_recent_logs(session, limit=20)
    return templates.TemplateResponse(
        "mind_map.html",
        {
            "request": request,
            "logs": logs,
        },
    )


@app.get("/api/mind-map", response_model=MindMapResponse)
async def get_mind_map_api(
    session: AsyncSession = Depends(get_session),
) -> MindMapResponse:
    return await crud.get_mind_map(session)


@app.post("/api/mind-map", response_model=MindMapResponse, status_code=201)
async def upsert_mind_map_api(
    payload: MindMapUpsert,
    session: AsyncSession = Depends(get_session),
) -> MindMapResponse:
    try:
        return await crud.upsert_mind_map(session, payload)
    except ValueError as exc:  # pragma: no cover - defensive branch
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/api/mind-map/logs", response_model=list[LogOut])
async def get_logs_api(
    session: AsyncSession = Depends(get_session),
    limit: int = Query(50, ge=1, le=200),
) -> list[LogOut]:
    return await crud.get_recent_logs(session, limit)
