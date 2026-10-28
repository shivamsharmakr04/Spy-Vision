from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.models.event import Event
from app.models.watchlist_vehicle import WatchlistVehicle


ALERT_EVENT_TYPES = {
    "INTRUSION": "HIGH",
    "NIGHT_MOVEMENT": "HIGH",
    "FACE_MATCH": "HIGH",
    "ANPR_MATCH": "HIGH",
    "OBJECT_DETECTED": "HIGH",
    "REACTION_ANALYSIS": "HIGH",
}


def should_create_alert(
    db: Session,
    event: Event,
) -> bool:

    # Normal alert-producing events
    if event.event_type in ALERT_EVENT_TYPES:
        return True

    # Watchlist vehicle match
    if event.event_type == "ANPR_MATCH":
        return True

    if event.event_type == "PLATE_DETECTED" and event.plate_number:
        vehicle = (
            db.query(WatchlistVehicle)
            .filter(
                WatchlistVehicle.plate_number == event.plate_number,
                WatchlistVehicle.enabled.is_(True),
            )
            .first()
        )

        return vehicle is not None

    return False


def create_alert(
    db: Session,
    event: Event,
) -> Alert | None:

    if not should_create_alert(db, event):
        return None

    if event.event_type in {"PLATE_DETECTED", "ANPR_MATCH"}:
        severity = "HIGH"
        message = f"Watchlist vehicle detected: {event.plate_number}"
    else:
        severity = ALERT_EVENT_TYPES[event.event_type]
        message = f"{event.event_type.replace('_', ' ').title()} detected"

    alert = Alert(
        event_id=event.id,
        severity=severity,
        status="ACTIVE",
        message=message,
    )

    db.add(alert)
    # db.commit()
    # db.refresh(alert)

    return alert
