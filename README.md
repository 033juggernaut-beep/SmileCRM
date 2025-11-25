# SmileCRM Telegram Mini App

Monorepo for the dental Telegram Mini App. It contains a frontend (Vite + React + TypeScript) and a backend (FastAPI + aiogram).

## Structure

- `frontend/` - client application powered by Vite React TS.
- `backend/` - FastAPI application with `app/bot/` reserved for aiogram.
- `docs/` - architecture references and existing specifications.

## Deployment

### Production URLs

- **Frontend (Vercel):** https://smilecrm-miniapp.vercel.app
- **Backend (Render):** https://smilecrm.onrender.com/api
- **Telegram Bot:** @SmileCRM_bot

### Frontend (Vercel)

The frontend is deployed on Vercel. Required environment variables:

- `VITE_API_BASE_URL` - Backend API URL (e.g., `https://smilecrm.onrender.com/api`)

To deploy:
1. Connect your GitHub repository to Vercel
2. Set the environment variable in Vercel dashboard
3. Vercel will auto-deploy on every push to `main`

### Backend (Render)

The backend is deployed on Render. Required environment variables:

- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `TELEGRAM_BOT_TOKEN` - Telegram bot token from @BotFather
- `FRONTEND_WEBAPP_URL` - Frontend URL (e.g., `https://smilecrm-miniapp.vercel.app`)
- `WEBHOOK_URL` - Backend URL for Telegram webhooks (e.g., `https://smilecrm.onrender.com`)

## Local Development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at http://localhost:5173

**Note:** In dev mode, if `VITE_API_BASE_URL` is not set, it defaults to `http://localhost:8000/api`

### Backend

1. Create a virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file with required variables (see above)

4. Run the server:
```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at http://localhost:8000

## Testing the Mini App

The Mini App must be opened through the Telegram bot @SmileCRM_bot. Opening it directly in a browser will show a message to open it in Telegram.

## Changes for Vercel Migration

The following changes were made to migrate from Netlify to Vercel:

1. **Frontend:**
   - Updated `vite.config.ts` to add `base: '/'` for SPA support
   - Added dev-mode fallback for `VITE_API_BASE_URL` in `client.ts`
   - Improved error handling for non-Telegram environments in `AuthLoadingPage`
   - Added `isInTelegram` detection in `useTelegramInitData` hook
   - Removed `netlify.toml`, added `vercel.json`

2. **Backend:**
   - Updated CORS to explicitly allow Vercel domain (`https://smilecrm-miniapp.vercel.app`)
   - Added localhost ports for local development
   - Made CORS configuration more secure (removed `allow_origins=["*"]`)

3. **Documentation:**
   - Updated README with Vercel deployment instructions
   - Added required environment variables for both platforms
   - Documented production URLs
