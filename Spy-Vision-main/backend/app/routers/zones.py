from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.camera import Camera
from app.models.zone import Zone
from app.schemas.zone import ZoneCreate, ZoneResponse, ZoneUpdate


router = APIRouter(
    prefix="/api/v1",
    tags=["Zones"],
)


@router.get("/zones", response_model=list[ZoneResponse])
def get_zones(db: Session = Depends(get_db)):
    return db.query(Zone).order_by(Zone.id).all()


@router.post(
    "/cameras/{camera_id}/zones",
    response_model=ZoneResponse,
    status_code=201,
)
def create_zone(
    camera_id: int,
    zone_data: ZoneCreate,
    db: Session = Depends(get_db),
):
    camera = db.query(Camera).filter(Camera.id == camera_id).first()

    if not camera:
        raise HTTPException(
            status_code=404,
            detail="Camera not found",
        )

    zone = Zone(
        camera_id=camera_id,
        **zone_data.model_dump(),
    )

    db.add(zone)
    db.commit()
    db.refresh(zone)

    return zone


@router.get(
    "/cameras/{camera_id}/zones",
    response_model=list[ZoneResponse],
)
def get_camera_zones(
    camera_id: int,
    db: Session = Depends(get_db),
):
    camera = db.query(Camera).filter(Camera.id == camera_id).first()

    if not camera:
        raise HTTPException(
            status_code=404,
            detail="Camera not found",
        )

    return (
        db.query(Zone)
        .filter(Zone.camera_id == camera_id)
        .all()
    )


@router.put(
    "/zones/{zone_id}",
    response_model=ZoneResponse,
)
def update_zone(
    zone_id: int,
    zone_data: ZoneUpdate,
    db: Session = Depends(get_db),
):
    zone = db.query(Zone).filter(Zone.id == zone_id).first()

    if not zone:
        raise HTTPException(
            status_code=404,
            detail="Zone not found",
        )

    update_data = zone_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(zone, field, value)

    db.commit()
    db.refresh(zone)

    return zone


@router.delete("/zones/{zone_id}")
def delete_zone(
    zone_id: int,
    db: Session = Depends(get_db),
):
    zone = db.query(Zone).filter(Zone.id == zone_id).first()

    if not zone:
        raise HTTPException(
            status_code=404,
            detail="Zone not found",
        )

    db.delete(zone)
    db.commit()

    return {
        "message": "Zone deleted successfully",
    }
