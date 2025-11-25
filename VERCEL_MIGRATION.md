# Vercel Migration Summary

This document summarizes the changes made to migrate SmileCRM from Netlify to Vercel for frontend deployment.

## Production URLs

- **Frontend (Vercel):** https://smilecrm-miniapp.vercel.app
- **Backend (Render):** https://smilecrm.onrender.com/api
- **Telegram Bot:** @SmileCRM_bot

## Changes Made

### 1. Frontend Changes

#### `frontend/src/api/client.ts`
- ✅ Added dev-mode fallback for `VITE_API_BASE_URL`
- ✅ If env variable is not set in dev mode, defaults to `http://localhost:8000/api`
- ✅ Throws error only in production mode if not configured

#### `frontend/vite.config.ts`
- ✅ Added `base: '/'` for SPA routing on Vercel
- ✅ Changed env validation to only require `VITE_API_BASE_URL` in production mode
- ✅ Allows dev mode to work without env variables

#### `frontend/src/hooks/useTelegramInitData.ts`
- ✅ Added `isInTelegram: boolean` field to `TelegramInitData` type
- ✅ Added detection logic using `window.Telegram` and `navigator.userAgent`
- ✅ Provides better context for error handling

#### `frontend/src/pages/AuthLoadingPage.tsx`
- ✅ Added friendly error screen when app is opened outside Telegram
- ✅ Shows clear instructions to open via @SmileCRM_bot
- ✅ Includes direct link to bot: https://t.me/SmileCRM_bot
- ✅ Only shows technical error if actually in Telegram but initData is missing

#### `frontend/src/utils/debug.ts`
- ✅ Created new file with debug utility functions
- ✅ `isDebugMode()` - checks if `?debug=true` query param is present
- ✅ `getDebugQueryParam()` - returns location.search
- ✅ `getCurrentHref()` - returns location.href

#### Configuration Files
- ✅ Removed `netlify.toml` (no longer needed)
- ✅ Added `vercel.json` with proper SPA configuration
- ✅ Updated `frontend/README.md` with Vercel instructions

### 2. Backend Changes

#### `backend/app/main.py`
- ✅ Updated CORS configuration to explicitly allow Vercel domain
- ✅ Changed from `allow_origins=["*"]` to specific allowed origins:
  - `https://smilecrm-miniapp.vercel.app` (production)
  - `http://localhost:5173` (local dev)
  - `http://localhost:5174` (alternative port)
  - `http://localhost:3000` (alternative port)
  - Dynamic addition of `FRONTEND_WEBAPP_URL` from env if set
- ✅ Specified allowed methods: `GET, POST, PUT, PATCH, DELETE, OPTIONS`
- ✅ Specified allowed headers: `Content-Type, Authorization, X-Requested-With`
- ✅ More secure CORS configuration

### 3. Documentation Changes

#### `README.md` (root)
- ✅ Added "Deployment" section with production URLs
- ✅ Added Vercel deployment instructions
- ✅ Added required environment variables for both platforms
- ✅ Added "Changes for Vercel Migration" section
- ✅ Updated local development instructions

#### `frontend/README.md`
- ✅ Added Vercel-specific setup instructions
- ✅ Documented environment variables
- ✅ Added note about Telegram Mini App behavior
- ✅ Clarified dev-mode fallback behavior

## Environment Variables

### Frontend (Vercel)

Required:
- `VITE_API_BASE_URL=https://smilecrm.onrender.com/api`

Optional:
- `VITE_TELEGRAM_BOT_NAME=SmileCRM_bot` (if used in code)

### Backend (Render)

Required:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `TELEGRAM_BOT_TOKEN` - Telegram bot token from @BotFather

Recommended:
- `FRONTEND_WEBAPP_URL=https://smilecrm-miniapp.vercel.app`
- `WEBHOOK_URL=https://smilecrm.onrender.com`

## Testing Checklist

- [x] Frontend builds successfully (`npm run build`)
- [x] TypeScript compilation passes (`npx tsc -b`)
- [x] No hardcoded URLs in frontend code
- [x] CORS configured for Vercel domain
- [x] Friendly error message for non-Telegram environments
- [ ] Test actual deployment on Vercel
- [ ] Test API communication between Vercel frontend and Render backend
- [ ] Test Telegram Mini App opening from bot
- [ ] Verify auth flow works end-to-end

## Deployment Steps

### Deploy to Vercel

1. Go to https://vercel.com and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Set environment variables:
   - `VITE_API_BASE_URL=https://smilecrm.onrender.com/api`
5. Click "Deploy"

Vercel will automatically detect the `vercel.json` configuration and deploy from the `frontend` directory.

### Update Backend (Render)

1. Go to your Render dashboard
2. Select the SmileCRM backend service
3. Add/update environment variable:
   - `FRONTEND_WEBAPP_URL=https://smilecrm-miniapp.vercel.app`
4. Render will automatically redeploy

## Rollback Plan

If issues arise, you can quickly rollback:

1. Revert the commits made for Vercel migration
2. Re-add `netlify.toml` from git history
3. Redeploy to Netlify
4. Update backend CORS to allow Netlify domain

## Notes

- All changes are backward-compatible for local development
- No changes to business logic or data models
- No changes to API endpoints or contracts
- Bot functionality remains unchanged

