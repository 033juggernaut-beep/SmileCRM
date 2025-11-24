# Frontend

Vite + React + TypeScript client for the Telegram Mini App.

## Setup

### Local Development

For local development, the app will automatically use `http://localhost:8000/api` if `VITE_API_BASE_URL` is not set.

Optionally, create a `.env.local` file in the `frontend` directory to override:

```bash
# Backend API base URL (includes /api prefix)
VITE_API_BASE_URL=http://localhost:8000/api
```

### Production (Vercel)

Set the following environment variable in Vercel dashboard:

```
VITE_API_BASE_URL=https://smilecrm.onrender.com/api
```

**Important:** The `baseURL` must include the `/api` prefix, as all API routes are mounted under `/api` on the backend.

## Scripts

- `npm install` - install dependencies
- `npm run dev` - start the dev server (http://localhost:5173)
- `npm run build` - build for production
- `npm run preview` - preview the production bundle

Source code lives in `src/`; global styles are in `src/App.css` and `src/index.css`.

## API Configuration

The API client is configured in `src/api/client.ts`:
- Uses `baseURL` from `import.meta.env.VITE_API_BASE_URL`
- Falls back to `http://localhost:8000/api` in development mode
- All requests are relative to this base URL
- Example: `apiClient.post('/auth/telegram', ...)` → `${baseURL}/auth/telegram` → `http://localhost:8000/api/auth/telegram`

## Telegram Mini App

This app is designed to run inside Telegram as a Mini App. When opened outside Telegram (e.g., directly in a browser), it will show a friendly message directing users to open it through the Telegram bot @SmileCRM_bot.
