from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.camera import Camera
from app.schemas.camera import CameraCreate, CameraResponse, CameraUpdate
from datetime import datetime, timezone

router = APIRouter(
    prefix="/api/v1/cameras",
    tags=["Cameras"],
)


@router.post(
    "",
    response_model=CameraResponse,
    status_code=201,
)
def create_camera(
    camera_data: CameraCreate,
    db: Session = Depends(get_db),
):
    camera = Camera(**camera_data.model_dump())

    db.add(camera)
    db.commit()
    db.refresh(camera)

    return camera


@router.get(
    "",
    response_model=list[CameraResponse],
)
def get_cameras(
    db: Session = Depends(get_db),
):
    return db.query(Camera).all()


@router.get(
    "/{camera_id}",
    response_model=CameraResponse,
)
def get_camera(
    camera_id: int,
    db: Session = Depends(get_db),
):
    camera = db.query(Camera).filter(Camera.id == camera_id).first()

    if not camera:
        raise HTTPException(
            status_code=404,
            detail="Camera not found",
        )

    return camera


@router.put(
    "/{camera_id}",
    response_model=CameraResponse,
)
def update_camera(
    camera_id: int,
    camera_data: CameraUpdate,
    db: Session = Depends(get_db),
):
    camera = db.query(Camera).filter(Camera.id == camera_id).first()

    if not camera:
        raise HTTPException(
            status_code=404,
            detail="Camera not found",
        )

    update_data = camera_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(camera, field, value)

    db.commit()
    db.refresh(camera)

    return camera


@router.delete(
    "/{camera_id}",
)
def delete_camera(
    camera_id: int,
    db: Session = Depends(get_db),
):
    camera = db.query(Camera).filter(Camera.id == camera_id).first()

    if not camera:
        raise HTTPException(
            status_code=404,
            detail="Camera not found",
        )

    db.delete(camera)
    db.commit()

    return {"message": "Camera deleted successfully"}


@router.post("/{camera_id}/heartbeat")
def camera_heartbeat(camera_id: int, db: Session = Depends(get_db)):
    camera = db.query(Camera).filter(Camera.id == camera_id).first()

    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")

    camera.status = "ONLINE"
    camera.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(camera)

    return {
        "message": "Camera heartbeat received",
        "camera_id": camera.id,
        "status": camera.status,
        "updated_at": camera.updated_at,
    }
