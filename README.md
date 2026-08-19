# Basecamp — Internal Task & Management Dashboard

A full-stack internal tool for creating, assigning, and tracking team tasks from a
central dashboard. Built with **React + Vite + Tailwind CSS** on the frontend and
**Python + FastAPI + SQLAlchemy** on the backend.

---

## Table of contents

- [Prerequisites](#prerequisites)
- [Project structure](#project-structure)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Database setup & seed data](#database-setup--seed-data)
- [Running the backend](#running-the-backend)
- [Running the frontend](#running-the-frontend)
- [API reference](#api-reference)
- [Architecture & key design decisions](#architecture--key-design-decisions)
- [Current user / authentication](#current-user--authentication)
- [External API integration](#external-api-integration)
- [Known limitations](#known-limitations)

---

## Prerequisites

- **Python** 3.10+
- **Node.js** 18+ and npm
- No external database is required — the project uses **SQLite** by default
  (a single file, zero setup). PostgreSQL is supported as a drop-in swap;
  see [Environment variables](#environment-variables).

## Project structure

```
project/
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI: Button, Modal, Table, StatusBadge, TaskForm, ...
│   │   ├── pages/          # Dashboard, TaskList, TaskDetails, NotFound
│   │   ├── layouts/         # AppLayout (sidebar + header)
│   │   ├── services/       # api.js + one service module per resource
│   │   ├── hooks/           # useToast, useCurrentUser, useDebounce
│   │   ├── utils/           # formatting helpers
│   │   └── App.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
├── backend/
│   ├── routes/        # FastAPI routers — thin, HTTP-only
│   ├── services/       # Business logic
│   ├── repositories/    # Database queries (SQLAlchemy)
│   ├── models/          # SQLAlchemy ORM models
│   ├── schemas/          # Pydantic request/response schemas
│   ├── database/          # Engine/session setup
│   ├── utils/               # Errors, pagination
│   ├── seed.py
│   ├── main.py
│   └── requirements.txt
└── README.md
```

## Quick start

```bash
# 1. Backend
cd backend
python -m venv .venv && source .venv/bin/activate   # optional but recommended
pip install -r requirements.txt
cp .env.example .env
python seed.py            # creates the SQLite DB and demo data
uvicorn main:app --reload --port 8000

# 2. Frontend (in a second terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open **http://localhost:5173**. The backend API runs on **http://localhost:8000**
(interactive docs at `http://localhost:8000/docs`).

## Environment variables

**backend/.env** (copy from `backend/.env.example`):

| Variable                       | Description                                                                                 | Default                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `DATABASE_URL`                 | SQLAlchemy connection string. SQLite by default; swap for a PostgreSQL URL to use Postgres. | `sqlite:///./taskdashboard.db`                |
| `CORS_ORIGINS`                 | Comma-separated list of origins allowed to call the API.                                    | `http://localhost:5173,http://127.0.0.1:5173` |
| `EXTERNAL_QUOTE_API_URL`       | Public API used for the dashboard's "Daily Focus Tip" widget.                               | `https://api.quotable.io/random`              |
| `EXTERNAL_API_TIMEOUT_SECONDS` | Timeout for the external API call, in seconds.                                              | `4`                                           |

**frontend/.env** (copy from `frontend/.env.example`):

| Variable            | Description                                         | Default                     |
| ------------------- | --------------------------------------------------- | --------------------------- |
| `VITE_API_BASE_URL` | Base URL the frontend uses to call the backend API. | `http://localhost:8000/api` |

No secrets or API keys are required for the external integration — `quotable.io` is a public, unauthenticated API.

### Using PostgreSQL instead of SQLite

1. Create a database and user, e.g. `createdb taskdashboard`.
2. `pip install psycopg2-binary` (not included by default, to keep the SQLite path zero-setup).
3. Set `DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/taskdashboard` in `backend/.env`.
4. Run `python seed.py` as usual — SQLAlchemy's `create_all` will create the tables.

## Database setup & seed data

Tables are created automatically on backend startup (`Base.metadata.create_all`),
which is fine for this project's scope. For a real production system, replace
this with **Alembic migrations** (noted in [Known limitations](#known-limitations)).

To populate demo data (5 users, 20 tasks in varied statuses/priorities, and
comments on several tasks):

```bash
cd backend
python seed.py
```

This is destructive — it clears existing rows before reseeding — which keeps
the dataset predictable for grading/demo purposes.

## Running the backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

- Health check: `GET http://localhost:8000/api/health`
- Interactive API docs (Swagger UI): `http://localhost:8000/docs`

## Running the frontend

```bash
cd frontend
npm run dev      # dev server on http://localhost:5173
npm run build    # production build to frontend/dist
npm run preview  # preview the production build locally
```

## API reference

All endpoints are prefixed with `/api`. All responses are JSON. Errors follow
a consistent shape: `{ "message": string, "code": string, "details": object|null }`.

### Tasks

| Method   | Endpoint                   | Description                                                                                              |
| -------- | -------------------------- | -------------------------------------------------------------------------------------------------------- |
| `GET`    | `/api/tasks`               | List tasks. Supports `status`, `priority`, `assignee`, `search`, `sort_by`, `sort_dir`, `page`, `limit`. |
| `GET`    | `/api/tasks/{id}`          | Get one task, including its comments.                                                                    |
| `POST`   | `/api/tasks`               | Create a task.                                                                                           |
| `PUT`    | `/api/tasks/{id}`          | Update a task (partial — only send changed fields).                                                      |
| `DELETE` | `/api/tasks/{id}`          | Delete a task and its comments.                                                                          |
| `POST`   | `/api/tasks/{id}/comments` | Add a comment/note to a task.                                                                            |

`sort_by` accepts: `due_date`, `created_at`, `updated_at`, `title`, `priority`, `status`.
`status` accepts: `pending`, `in_progress`, `completed`, `blocked`.
`priority` accepts: `low`, `medium`, `high`, `urgent`.

Example:

```
GET /api/tasks?status=in_progress&priority=high&search=shopify&page=1&limit=20&sort_by=due_date&sort_dir=asc
```

### Users

| Method | Endpoint     | Description     |
| ------ | ------------ | --------------- |
| `GET`  | `/api/users` | List all users. |
| `POST` | `/api/users` | Create a user.  |

### Dashboard

| Method | Endpoint                              | Description                                                                                                                   |
| ------ | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/api/dashboard?current_user_id={id}` | Aggregate metrics: totals by status, overdue count, tasks assigned to `current_user_id`, priority breakdown, completion rate. |

### External integration

| Method | Endpoint                  | Description                                                                                      |
| ------ | ------------------------- | ------------------------------------------------------------------------------------------------ |
| `GET`  | `/api/external/daily-tip` | Fetches a motivational quote from `quotable.io`; falls back to a local quote on timeout/failure. |

## Architecture & key design decisions

- **Layered backend** — routes call services (business rules) which call
  repositories (SQLAlchemy queries). Routes never touch the DB directly, and
  repositories contain no business rules. This keeps each layer independently
  testable and matches the spec's "separate business logic from route handlers"
  requirement.
- **Schemas vs. models** — Pydantic schemas (`schemas/`) are the API's public
  contract and are kept separate from SQLAlchemy models (`models/`), so the
  wire format can change without touching storage, and vice versa.
- **Server-side everything** — filtering, search, sorting, and pagination all
  happen in the database query (`repositories/task_repository.py`), not in the
  browser. The frontend never loads the full task table.
- **Consistent error contract** — a single `AppError` exception (and two
  subclasses, `NotFoundError` / `ValidationAppError`) is the only way routes
  raise errors, so every error response has the same JSON shape and the
  frontend has one code path (`ApiError` in `services/api.js`) for handling
  failures.
- **Frontend service layer** — components never call `fetch` directly; each
  resource has a thin service module (`taskService`, `userService`, ...) built
  on a shared `api.js` client that adds timeouts, JSON headers, and error
  normalization in one place.
- **URL-driven task list state** — search, filters, sort, and page are stored
  in the URL's query string (`useSearchParams`), so a filtered/sorted view is
  shareable and survives a refresh or back-navigation.
- **External API kept secondary** — the `quotable.io` integration powers a
  small dashboard widget, not core functionality, per the spec. It has an
  explicit timeout and a local fallback quote so a third-party outage never
  breaks the dashboard.

## Current user / authentication

Authentication uses JWT bearer tokens. Create an account at `/signup` or log
in at `/login`; the token is centralized in the frontend auth utility and the
backend resolves the current user from `GET /api/auth/me`. Dashboard, task, and
comment routes require authentication. Comment authorship and dashboard
"assigned to me" metrics come from the authenticated identity rather than a
frontend-selected user ID.

For local development, copy `backend/.env.example` and
`frontend/.env.example` to `.env` files. Set a strong `JWT_SECRET_KEY` outside
of development. Existing databases are upgraded at startup with the new user
authentication columns; production deployments should use a migration tool.

## External API integration

The dashboard's "Daily Focus Tip" card calls `GET /api/external/daily-tip`,
which the backend fulfills by calling the public `quotable.io` API
(`services/external_api_service.py`). It demonstrates:

- An outbound async HTTP request (`httpx.AsyncClient`)
- A configurable timeout (`EXTERNAL_API_TIMEOUT_SECONDS`)
- Graceful degradation — on timeout, HTTP error, or malformed response, the
  backend returns a local fallback quote instead of failing the request, and
  flags the response with `"is_fallback": true` so the UI can note it

## Known limitations

- **Auth** is a demo "current user" switcher, not password/token-based login
  (see above) — intentional for this project's scope, but the first thing to
  replace before real deployment.
- **Migrations**: tables are created via `Base.metadata.create_all` on startup
  rather than versioned Alembic migrations. Fine for a fresh SQLite file; a
  production system should add Alembic before its first schema change.
- **No automated test suite** is included. The layered architecture
  (repositories/services/routes) is structured to make unit and integration
  tests straightforward to add (e.g. `pytest` + `TestClient` for routes,
  an in-memory SQLite DB for repositories).
- **No Kanban/drag-and-drop board, CSV export, or dark mode** — listed as
  bonus features in the spec; the "Quick status" buttons on the task detail
  page cover the core status-changing workflow instead.
- **Activity/audit log** is not implemented beyond `created_at` / `updated_at`
  timestamps and comments; a dedicated `activity_log` table would be the next
  step for full change history.
