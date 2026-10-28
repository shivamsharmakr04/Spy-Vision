from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ZoneBase(BaseModel):
    name: str
    type: str
    coordinates: list[tuple[float, float]] = Field(min_length=3)
    enabled: bool = True
    sensitivity: float = Field(default=0.85, ge=0, le=1)


class ZoneCreate(ZoneBase):
    pass


class ZoneUpdate(BaseModel):
    name: str | None = None
    type: str | None = None
    coordinates: list[tuple[float, float]] | None = Field(default=None, min_length=3)
    enabled: bool | None = None
    sensitivity: float | None = Field(default=None, ge=0, le=1)


class ZoneResponse(ZoneBase):
    id: int
    camera_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
