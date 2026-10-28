from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from sqlalchemy.exc import SQLAlchemyError

from app.database import get_db
from app.models.event import Event
from app.schemas.event import EventCreate, EventResponse
from app.services import event_service
from app.websocket.manager import manager

from app.utils.auth import verify_ai_api_key
from app.config import settings

# for securing ai api key authentication

router = APIRouter(
    prefix="/api/v1/events",
    tags=["Events"],
)


async def _create_event(
    event_data: EventCreate,
    db: Session = Depends(get_db),
):
    try:
        event = event_service.create_event(db, event_data)

        if event.alert:
            await manager.broadcast({
                "type": "ALERT_CREATED",
                "data": {
                    "id": event.alert.id,
                    "event_id": event.id,
                    "camera_id": event.camera_id,
                    "event_type": event.event_type,
                    "severity": event.alert.severity,
                    "status": event.alert.status,
                    "message": event.alert.message,
                    "timestamp": event.timestamp.isoformat(),
                    "snapshot_path": event.snapshot_path,
                },
            })

        return event

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Database operation failed",
        )


@router.post(
    "",
    response_model=EventResponse,
    status_code=201,
    dependencies=[Depends(verify_ai_api_key)],
)
async def create_event(
    event_data: EventCreate,
    db: Session = Depends(get_db),
):
    return await _create_event(event_data, db)


@router.post(
    "/simulate",
    response_model=EventResponse,
    status_code=201,
)
async def simulate_event(
    event_data: EventCreate,
    db: Session = Depends(get_db),
):
    if not settings.debug:
        raise HTTPException(status_code=404, detail="Not found")
    return await _create_event(event_data, db)


@router.get("")
def get_events(
    camera_id: int | None = None,
    event_type: str | None = None,
    severity: str | None = None,
    start_time: datetime | None = None,
    end_time: datetime | None = None,
    plate_number: str | None = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Event)

    if camera_id is not None:
        query = query.filter(Event.camera_id == camera_id)

    if event_type is not None:
        query = query.filter(Event.event_type == event_type)

    if severity is not None:
        query = query.filter(Event.severity == severity)

    if start_time is not None:
        query = query.filter(Event.timestamp >= start_time)

    if end_time is not None:
        query = query.filter(Event.timestamp <= end_time)

    if plate_number is not None:
        query = query.filter(
            Event.plate_number == plate_number
        )

    total = query.count()

    events = (
        query
        .order_by(Event.timestamp.desc())
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    return {
        "items": events,
        "total": total,
        "page": page,
        "limit": limit,
    }


@router.get(
    "/{event_id}",
    response_model=EventResponse,
)
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
):
    event = (
        db.query(Event)
        .filter(Event.id == event_id)
        .first()
    )

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Event not found",
        )

    return event
