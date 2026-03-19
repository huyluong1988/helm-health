Helm Health - Full Stack Scaffold (Interview)

This repo is a lightweight full-stack scaffold built for a technical interview:

- Frontend: React + TypeScript
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL (plain `pg`, no ORM) with placeholders for 5 models
- Auth: dummy login that issues a token and enables protected routes (demo only)
- API: REST endpoints only

## Prerequisites

- Node.js 18+ (recommended)
- Docker (to run PostgreSQL quickly)

## 1) Start PostgreSQL

From the repo root:

1. `docker compose up -d`
2. Create tables:
   - `docker compose exec db psql -U postgres -d helm_health -f /docker-entrypoint-initdb.d/init.sql`

## 2) Backend

1. `cd backend`
2. `cp .env.example .env`
3. `npm install`
4. `npm run dev`

Backend default:

- `http://localhost:3001`

## 3) Frontend

1. `cd frontend`
2. `npm install`
3. `npm run dev`

Frontend default:

- `http://localhost:5173`

## API Quick Map

- `POST /api/auth/login` (dummy)
- `GET /api/auth/me` (dummy, token required)
- `GET /api/models` (lists model placeholders: `model1`..`model5`)
- CRUD for each model:
  - `GET /api/models/:modelName`
  - `POST /api/models/:modelName`
  - `GET /api/models/:modelName/:id`
  - `DELETE /api/models/:modelName/:id`

## Notes for the Interview

- The backend uses `pg` with a shared pool and parameterized SQL.
- Model structure is intentionally generic to make it easy to add more models quickly.
- The dummy auth middleware is only to demonstrate a protected-route pipeline.

