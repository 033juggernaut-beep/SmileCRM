# SmileCRM Telegram Mini App

Monorepo for the dental Telegram Mini App. It contains a frontend (Vite + React + TypeScript) and a backend (FastAPI + aiogram).

## Structure

- `frontend/` - client application powered by Vite React TS.
- `backend/` - FastAPI application with `app/bot/` reserved for aiogram.
- `docs/` - architecture references and existing specifications.

## Quick start

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

Create and activate a Python virtual environment, install dependencies (to be defined later) and run:

```bash
uvicorn app.main:app --reload
```

> Docker and ngrok are intentionally not used; rely on the native Node.js and Python toolchains.
