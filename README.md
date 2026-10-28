# IBVAP — Intelligent Border Video Analytics Platform

> A full-stack command-and-control prototype for monitoring camera feeds, security events, alerts, zones, and operational watchlists.

[![Backend](https://img.shields.io/badge/backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=111827)](https://react.dev/)
[![Database](https://img.shields.io/badge/database-PostgreSQL%20%2F%20SQLite-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Realtime](https://img.shields.io/badge/realtime-WebSocket-111827)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

## Overview

IBVAP is a full-stack video-analytics command-center project. The repository combines a React/Vite operator interface with a FastAPI backend for camera management, zones, events, alerts, watchlists, dashboard data, media, health checks, and real-time alert delivery.

The project is designed as a **software prototype** for security-monitoring workflows. The repository documentation describes AI/video-analytics integration points, while the currently tracked backend dependency set focuses on the web API, database, WebSocket, and application infrastructure.

## ✨ Core Capabilities

- Camera and multi-view monitoring workflows
- Camera zones and virtual-boundary management
- Event and alert management
- Person and vehicle watchlists
- Dashboard and operational statistics
- Media/snapshot handling
- REST API with automatic OpenAPI documentation
- Real-time alert channel through WebSockets
- Health endpoint with database connectivity check
- PostgreSQL support through Docker Compose
- Local SQLite/PostgreSQL development architecture

## 🏗️ Architecture

```text
┌─────────────────────┐
│   React + Vite UI   │
│  Operator Console   │
└──────────┬──────────┘
           │ HTTP / WebSocket
           ▼
┌─────────────────────┐
│     FastAPI API     │
│ routers / services  │
└───────┬─────────┬───┘
        │         │
        ▼         ▼
   SQLAlchemy   WebSocket
        │       alerts
        ▼
┌─────────────────────┐
│ SQLite / PostgreSQL │
└─────────────────────┘
```

## 🧰 Technology Stack

### Frontend

- React 18
- Vite 6
- Tailwind CSS 4
- Lucide React

### Backend

- FastAPI
- Uvicorn
- SQLAlchemy
- Alembic
- Pydantic Settings
- WebSockets
- Pytest / HTTPX

### Infrastructure

- PostgreSQL 16
- Docker / Docker Compose
- Environment-based configuration

## 📁 Repository Structure

```text
IBVAP/
├── Spy-Vision-main/
│   ├── frontend/
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.js
│   │
│   └── backend/
│       ├── app/
│       │   ├── models/
│       │   ├── routers/
│       │   ├── schemas/
│       │   ├── services/
│       │   ├── utils/
│       │   ├── websocket/
│       │   ├── main.py
│       │   └── config.py
│       ├── alembic/
│       ├── media/
│       ├── requirements.txt
│       ├── Dockerfile
│       └── docker-compose.yml
└── README.md
```

## 🚀 Local Development

### 1. Clone

```bash
git clone https://github.com/shivamsharmakr04/IBVAP.git
cd IBVAP/Spy-Vision-main
```

### 2. Start the backend

```bash
cd backend
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

macOS/Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create your environment file from the variables expected by `app.config`, then start the API:

```bash
cp .env.example .env
# Set AI_API_KEY to a private local value before using the AI event endpoint.
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.
The app applies Alembic migrations automatically when the backend starts. The local
example enables the development-only event simulator; keep `DEBUG=false` outside
local development. The initial database is empty, so register a camera in Camera
Manager before testing event simulations. Use a browser-playable stream URL such as
MP4 or HLS; browsers cannot play RTSP URLs directly.

Backend endpoints:

- API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health check: `http://localhost:8000/health`
- Alerts WebSocket: `ws://localhost:8000/ws/alerts`

### 3. Start the frontend

Open a second terminal:

```bash
cd IBVAP/Spy-Vision-main/frontend
npm install
npm run dev
```

Use the Vite URL printed by the terminal. Do not assume a fixed frontend port; Vite may select another available port automatically.

## 🐳 Docker / PostgreSQL

The backend includes a Docker Compose setup for PostgreSQL and the FastAPI service:

```bash
cd IBVAP/Spy-Vision-main/backend
docker compose up --build
```

The Compose configuration reads optional values from `backend/.env`. Do not commit
real credentials. Keep local secrets in `.env` and use `.env.example` only as a
template. Simulation is disabled in Docker unless `DEBUG=true` is set explicitly.

## 🔌 API Surface

The backend currently registers routers covering:

- Cameras
- Zones
- Events
- Alerts
- Watchlists
- Dashboard
- Media

FastAPI exposes the generated API documentation at `/docs` when the server is running.

## 🧪 Testing

The backend dependency set includes Pytest and HTTPX. Run the project's available tests from the backend directory:

```bash
pytest
```

## 🤝 Contributing

Contributions that improve the prototype, documentation, accessibility, reliability, tests, or developer experience are welcome.

### How to contribute

1. Fork the repository and create a focused branch.
2. Make a clear, scoped change and add or update tests where appropriate.
3. Run the relevant tests and check that the application still starts locally.
4. Commit your changes with a descriptive message.
5. Open a pull request describing the problem, solution, and validation performed.

### Contribution guidelines

- Keep pull requests focused and explain any important design decisions.
- Do not commit secrets, API keys, passwords, private datasets, or sensitive footage.
- Avoid claiming production-grade detection or identity verification unless it has been tested and documented.
- Include setup steps and screenshots for meaningful UI changes when helpful.
- Be respectful and constructive in issues and code reviews.

## 🔐 Security Notes

This repository is a development/prototype project and should not be treated as a production border-security system without a dedicated security review.

Before production deployment:

- Restrict CORS origins instead of using wildcard origins.
- Store database credentials and application secrets outside Git.
- Add authentication/authorization to sensitive endpoints.
- Review media upload and file-serving controls.
- Add audit and access-control tests.
- Run dependency and code-security scanning.

The browser UI does not contain the AI API key. Direct event ingestion at
`POST /api/v1/events` requires the `X-AI-API-Key` value configured on the backend.
The browser's synthetic-event endpoint is available only when `DEBUG=true`.

## 📌 Project Status

**Status:** Active development / prototype.

The repository currently provides the application foundation and operator workflows. Real-world camera integrations, production-grade computer-vision inference, identity verification, and deployment hardening should be validated independently before being described as production capabilities.

## 👨‍💻 Author

**Shivam Kumar**  
Full-Stack Developer

[GitHub](https://github.com/shivamsharmakr04) · [LinkedIn](https://linkedin.com/in/shivam-kumar-b0aab2209)

## 📄 License

No license file is currently declared in the repository. Add an explicit license before distributing the project as open-source software.
