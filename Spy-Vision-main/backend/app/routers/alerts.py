from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.alert import Alert
from app.models.event import Event
from app.schemas.alert import AlertResponse


router = APIRouter(
    prefix="/api/v1/alerts",
    tags=["Alerts"],
)


def _alerts_query(db: Session):
    return db.query(Alert).options(
        joinedload(Alert.event).joinedload(Event.camera)
    )


@router.get(
    "",
    response_model=list[AlertResponse],
)
def get_alerts(
    db: Session = Depends(get_db),
):
    return (
        _alerts_query(db)
        .order_by(Alert.created_at.desc())
        .all()
    )


@router.get(
    "/{alert_id}",
    response_model=AlertResponse,
)
def get_alert(
    alert_id: int,
    db: Session = Depends(get_db),
):
    alert = (
        _alerts_query(db)
        .filter(Alert.id == alert_id)
        .first()
    )

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found",
        )

    return alert


@router.post(
    "/{alert_id}/acknowledge",
    response_model=AlertResponse,
)
def acknowledge_alert(
    alert_id: int,
    db: Session = Depends(get_db),
):
    alert = (
        _alerts_query(db)
        .filter(Alert.id == alert_id)
        .first()
    )

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found",
        )

    if alert.status == "RESOLVED":
        raise HTTPException(
            status_code=400,
            detail="Resolved alert cannot be acknowledged",
        )

    alert.status = "ACKNOWLEDGED"
    alert.acknowledged_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(alert)

    return alert


@router.post(
    "/{alert_id}/resolve",
    response_model=AlertResponse,
)
def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db),
):
    alert = (
        _alerts_query(db)
        .filter(Alert.id == alert_id)
        .first()
    )

    if not alert:
        raise HTTPException(
            status_code=404,
            detail="Alert not found",
        )

    if alert.status == "RESOLVED":
        raise HTTPException(
            status_code=400,
            detail="Alert is already resolved",
        )

    alert.status = "RESOLVED"
    alert.resolved_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(alert)

    return alert
