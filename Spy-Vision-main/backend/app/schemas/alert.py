from datetime import datetime
from enum import Enum

from pydantic import AliasPath, BaseModel, ConfigDict, Field


class AlertSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AlertStatus(str, Enum):
    ACTIVE = "ACTIVE"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESOLVED = "RESOLVED"


class AlertResponse(BaseModel):
    id: int
    event_id: int
    severity: AlertSeverity
    status: AlertStatus
    message: str
    created_at: datetime
    acknowledged_at: datetime | None
    resolved_at: datetime | None
    camera_id: int = Field(validation_alias=AliasPath("event", "camera_id"))
    camera_name: str | None = Field(
        default=None,
        validation_alias=AliasPath("event", "camera", "name"),
    )
    event_type: str = Field(validation_alias=AliasPath("event", "event_type"))
    timestamp: datetime = Field(validation_alias=AliasPath("event", "timestamp"))
    snapshot_path: str | None = Field(
        default=None,
        validation_alias=AliasPath("event", "snapshot_path"),
    )

    model_config = ConfigDict(from_attributes=True)



# from datetime import datetime

# from pydantic import BaseModel, ConfigDict


# class AlertResponse(BaseModel):
#     id: int
#     event_id: int
#     severity: str
#     status: str
#     message: str
#     created_at: datetime
#     acknowledged_at: datetime | None
#     resolved_at: datetime | None

#     model_config = ConfigDict(from_attributes=True)
