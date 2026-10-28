from contextlib import asynccontextmanager
from pathlib import Path

from alembic import command
from alembic.config import Config
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy import inspect, text

from app.config import settings
from app.database import engine

# Import all models to register with Base.metadata
from app.models.camera import Camera
from app.models.zone import Zone
from app.models.event import Event
from app.models.alert import Alert
from app.models.watchlist_person import WatchlistPerson
from app.models.watchlist_vehicle import WatchlistVehicle
from app.models.user import User

from app.routers.cameras import router as cameras_router
from app.routers.zones import router as zones_router
from app.routers.events import router as events_router
from app.routers.alerts import router as alerts_router
from app.routers.media import router as media_router
from app.websocket.manager import manager
from app.routers import watchlist
from app.routers import dashboard
from app.utils.logging import setup_logging
from fastapi.middleware.cors import CORSMiddleware

def migrate_database() -> None:
    config = Config(str(Path(__file__).resolve().parents[1] / "alembic.ini"))
    existing_tables = set(inspect(engine).get_table_names())
    legacy_tables = {
        "users",
        "cameras",
        "zones",
        "events",
        "alerts",
        "watchlist_persons",
        "watchlist_vehicles",
    }
    if "alembic_version" not in existing_tables and legacy_tables.issubset(existing_tables):
        # Older app versions created tables directly without recording Alembic state.
        command.stamp(config, "6a81579fda10")
    command.upgrade(config, "head")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    migrate_database()
    yield

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

setup_logging()

app.include_router(cameras_router)
app.include_router(zones_router)
app.include_router(events_router)
app.include_router(alerts_router)
app.include_router(watchlist.router)
app.include_router(dashboard.router)
app.include_router(media_router)


@app.get("/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail={"status": "unhealthy", "database": "disconnected"},
        ) from e


@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    await manager.connect(websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
