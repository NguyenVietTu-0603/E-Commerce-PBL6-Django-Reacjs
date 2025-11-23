# E-Commerce PBL6 (Docker Deployment)

This project pairs a Django backend with a React frontend. The following Docker setup lets you build and serve both services simultaneously with `docker compose`.

## Requirements

- Docker Engine (check with `docker --version`)
- Docker Compose v2 (already bundled with Docker Desktop)

## Services

- **Backend**: Django + Gunicorn, managed via `backend/Dockerfile`. It migrates the database, collects static files, and serves the API on port `8000`.
- **Frontend**: React built with CRACO and served by Nginx. The production build hits the backend API via `REACT_APP_API_BASE_URL`.

## Running with Docker Compose

```powershell
cd path\to\PBL6\main
docker compose up --build
```

- Visit `http://localhost:3000` to access the storefront.
- The API is available at `http://localhost:8000`.

## Customizing the build

- Set `REACT_APP_API_BASE_URL` before running `docker compose` to point the React app at a custom backend (e.g., staging or production).
- The backend image reads `DJANGO_DEBUG=0` by default; export `DJANGO_DEBUG=1` in the environment if you need debug logging.

Example (PowerShell):

```powershell
$env:REACT_APP_API_BASE_URL = 'https://api.example.com'
docker compose up --build
```

## Persisting data

- SQLite database and uploaded media files are persisted via bind mounts at `backend/db.sqlite3` and `backend/media/`.

## Notes

- The backend uses `django-cors-headers` with `ALLOWED_HOSTS = ['*']`, which is convenient for Docker development but should be tightened for production.
- The frontend proxies `/api` calls to `http://backend:8000/api/` inside the Docker network, ensuring API traffic routes through the backend service.
- `collectstatic` now writes to `backend/staticfiles`, which is mounted into the container so the backend and future CDNs can reuse the prepared assets.
