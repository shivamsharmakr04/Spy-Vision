import os
import tempfile
from pathlib import Path
from uuid import uuid4

os.environ["DATABASE_URL"] = (
    "sqlite:///" + Path(tempfile.gettempdir(), f"spyvision-tests-{os.getpid()}.db").as_posix()
)
os.environ["AI_API_KEY"] = "ibvap-ai-secret-2026"
os.environ["DEBUG"] = "true"

from fastapi.testclient import TestClient
import pytest
from sqlalchemy import delete

from app.main import app
from app.database import Base, SessionLocal
from app.models.camera import Camera


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        with SessionLocal() as db:
            for table in reversed(Base.metadata.sorted_tables):
                db.execute(delete(table))
            db.add(Camera(
                id=1,
                name="Test Camera",
                location="Test Site",
                stream_url="http://localhost/test-stream",
                status="ONLINE",
            ))
            db.commit()
        yield test_client


def test_health(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_create_event(client):
    response = client.post(
        "/api/v1/events",
        json={
            "camera_id": 1,
            "event_type": "INTRUSION",
            "timestamp": "2026-09-05T10:00:00Z",
            "confidence": 0.95,
            "severity": "HIGH",
            "metadata": {
                "object_type": "person"
            }
        },
        headers={
            "X-AI-API-Key": "ibvap-ai-secret-2026"
        },
    )

    assert response.status_code == 201
    assert response.json()["event_type"] == "INTRUSION"


def test_create_event_without_api_key(client):
    response = client.post(
        "/api/v1/events",
        json={
            "camera_id": 1,
            "event_type": "INTRUSION",
            "timestamp": "2026-09-05T10:00:00Z",
            "confidence": 0.95,
            "severity": "HIGH",
        },
    )

    assert response.status_code == 401



def test_create_event_with_invalid_api_key(client):
    response = client.post(
        "/api/v1/events",
        json={
            "camera_id": 1,
            "event_type": "INTRUSION",
            "timestamp": "2026-09-05T10:00:00Z",
            "confidence": 0.95,
            "severity": "HIGH",
        },
        headers={
            "X-AI-API-Key": "wrong-key",
        },
    )

    assert response.status_code == 401

def test_intrusion_creates_alert(client):
    response = client.post(
        "/api/v1/events",
        json={
            "camera_id": 1,
            "event_type": "INTRUSION",
            "timestamp": "2026-09-05T10:00:00Z",
            "confidence": 0.95,
            "severity": "HIGH",
        },
        headers={"X-AI-API-Key": "ibvap-ai-secret-2026"},
    )

    assert response.status_code == 201

    event_id = response.json()["id"]

    alert_response = client.get(f"/api/v1/alerts")

    assert alert_response.status_code == 200
    alerts = alert_response.json()

    assert any(alert["event_id"] == event_id for alert in alerts)


def test_watchlist_plate_creates_alert(client):
    plate_number = f"UP32TEST{uuid4().hex[:4].upper()}"

    watchlist_response = client.post(
        "/api/v1/watchlist/vehicles",
        json={
            "plate_number": plate_number,
            "vehicle_type": "SUV",
            "description": "Test vehicle",
            "enabled": True,
        },
    )

    assert watchlist_response.status_code == 201

    event_response = client.post(
        "/api/v1/events",
        json={
            "camera_id": 1,
            "event_type": "PLATE_DETECTED",
            "timestamp": "2026-09-05T10:00:00Z",
            "confidence": 0.98,
            "severity": "LOW",
            "plate_number": plate_number,
        },
        headers={
            "X-AI-API-Key": "ibvap-ai-secret-2026"
        },
    )

    assert event_response.status_code == 201
    event_id = event_response.json()["id"]
    alerts = client.get("/api/v1/alerts")
    assert alerts.status_code == 200
    assert any(alert["event_id"] == event_id for alert in alerts.json())


def test_zone_polygon_and_sensitivity_round_trip(client):
    response = client.post(
        "/api/v1/cameras/1/zones",
        json={
            "name": "Fence line",
            "type": "INTRUSION_ZONE",
            "coordinates": [[0.1, 0.2], [0.8, 0.2], [0.7, 0.9]],
            "enabled": True,
            "sensitivity": 0.72,
        },
    )

    assert response.status_code == 201
    zone_id = response.json()["id"]
    assert response.json()["sensitivity"] == 0.72

    listed = client.get("/api/v1/zones")
    assert listed.status_code == 200
    assert listed.json()[0]["coordinates"] == [[0.1, 0.2], [0.8, 0.2], [0.7, 0.9]]
    assert listed.json()[0]["id"] == zone_id


def test_debug_simulation_creates_ui_ready_alert(client):
    response = client.post(
        "/api/v1/events/simulate",
        json={
            "camera_id": 1,
            "event_type": "ANPR_MATCH",
            "timestamp": "2026-10-28T10:00:00Z",
            "confidence": 0.98,
            "severity": "HIGH",
            "plate_number": "DEMO-123",
        },
    )
    assert response.status_code == 201

    alerts = client.get("/api/v1/alerts")
    assert alerts.status_code == 200
    alert = alerts.json()[0]
    assert alert["camera_id"] == 1
    assert alert["event_type"] == "ANPR_MATCH"
    assert alert["camera_name"] == "Test Camera"
