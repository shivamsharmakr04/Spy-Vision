from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.utils.time import utc_now


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    camera_id: Mapped[int] = mapped_column(
        ForeignKey("cameras.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    event_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )

    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )

    confidence: Mapped[float | None] = mapped_column(
        Float,
        nullable=True,
    )

    severity: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="LOW",
        index=True,
    )

    # "metadata" is a reserved SQLAlchemy attribute,
    # so Python uses event_metadata while the DB column remains "metadata".
    event_metadata: Mapped[dict | None] = mapped_column(
        "metadata",
        JSON,
        nullable=True,
    )

    plate_number: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        index=True,
    )

    snapshot_path: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    clip_path: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )

    camera = relationship(
        "Camera",
        back_populates="events",
    )

    alert = relationship(
        "Alert",
        back_populates="event",
        uselist=False,
        cascade="all, delete-orphan",
    )
