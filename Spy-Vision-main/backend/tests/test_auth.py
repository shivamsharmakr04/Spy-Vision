import os
import tempfile
from pathlib import Path
from uuid import uuid4

os.environ["DATABASE_URL"] = (
    "sqlite:///" + Path(tempfile.gettempdir(), f"spyvision-auth-tests-{os.getpid()}.db").as_posix()
)
os.environ["AI_API_KEY"] = "ibvap-ai-secret-2026"
os.environ["DEBUG"] = "true"

from fastapi.testclient import TestClient
import pytest
from sqlalchemy import delete

from app.main import app
from app.database import Base, SessionLocal


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        with SessionLocal() as db:
            for table in reversed(Base.metadata.sorted_tables):
                db.execute(delete(table))
            db.commit()
        yield test_client


def test_register_operator(client):
    res = client.post(
        "/api/v1/auth/register",
        json={
            "username": "operator1",
            "password": "Password123!",
            "full_name": "Commander Singh",
            "badge_number": "BSF-001",
            "role": "COMMANDER",
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert "token" in data
    assert data["user"]["username"] == "operator1"
    assert data["user"]["full_name"] == "Commander Singh"
    assert data["user"]["badge_number"] == "BSF-001"
    assert data["user"]["is_verified"] is True


def test_register_duplicate_username(client):
    payload = {
        "username": "operator_dup",
        "password": "Password123!",
        "full_name": "Officer Test",
        "badge_number": "BSF-002",
        "role": "OPERATOR",
    }
    res1 = client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 409


def test_login_success_and_get_me(client):
    # Register
    reg = client.post(
        "/api/v1/auth/register",
        json={
            "username": "operator_login",
            "password": "SecurePassword999",
            "full_name": "Specialist Anita",
            "badge_number": "BSF-003",
        },
    )
    assert reg.status_code == 201

    # Login
    login_res = client.post(
        "/api/v1/auth/login",
        json={
            "username": "operator_login",
            "password": "SecurePassword999",
        },
    )
    assert login_res.status_code == 200
    token = login_res.json()["token"]

    # Access /me
    me_res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["username"] == "operator_login"
    assert me_data["full_name"] == "Specialist Anita"
    assert me_data["is_verified"] is True


def test_login_invalid_password(client):
    client.post(
        "/api/v1/auth/register",
        json={
            "username": "operator_bad",
            "password": "CorrectPassword123",
            "full_name": "Operator Bad",
        },
    )
    res = client.post(
        "/api/v1/auth/login",
        json={
            "username": "operator_bad",
            "password": "WrongPassword",
        },
    )
    assert res.status_code == 401


def test_me_without_token(client):
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 401

