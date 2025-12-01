# 🔧 Fix: Network Error when Creating Visits

## Problem
When trying to create a visit, you see "Network Error" message.

## Root Causes (in order of likelihood)

### 1. ⚠️ Backend Server is Sleeping (Most Likely)
**Render free tier** puts apps to sleep after 15 minutes of inactivity. The first request after sleep takes 30-60 seconds to wake up.

**Solution:**
- Wait 30-60 seconds and try again
- Or upgrade to Render paid tier ($7/month) to keep server always on

### 2. ⚠️ Missing Environment Variable in Vercel
The frontend needs to know where the backend is.

**Check Vercel Configuration:**
1. Go to https://vercel.com/dashboard
2. Select your project: `smilecrm-miniapp`
3. Go to **Settings** → **Environment Variables**
4. Verify `VITE_API_BASE_URL` is set to: `https://smilecrm.onrender.com/api`
5. If missing or wrong, add/update it
6. **Important:** After changing env vars, you must **redeploy** the frontend

**To Redeploy:**
- Go to **Deployments** tab
- Click the three dots (...) on the latest deployment
- Click **Redeploy**

### 3. ⚠️ Backend is Down
Check if the backend is running:
- Open: https://smilecrm.onrender.com/health
- Should return: `{"status":"ok"}`
- If it returns error or doesn't load, backend is down

### 4. ⚠️ CORS Issue
The backend needs to allow requests from the frontend.

**Already configured in `backend/app/main.py`:**
```python
allowed_origins = [
  "https://smilecrm-miniapp.vercel.app",  # Your production URL
  "http://localhost:5173",  # Local dev
]
```

## What We Fixed

### 1. ✅ Better Error Messages
Updated `PatientDetailsPage.tsx` to show more detailed error messages:
- Before: Generic "Network Error"
- Now: Shows actual server error or specific network issue

### 2. ✅ Added Request Logging
Updated `client.ts` to log all API errors to console:
- Open browser DevTools (F12)
- Check Console tab for detailed error information

### 3. ✅ Added Timeout
Requests now timeout after 30 seconds instead of hanging forever.

## 🚀 Deploy the Fix

```bash
# Stage all changes
git add -A

# Commit
git commit -m "fix: Improve error handling for visit creation"

# Push to trigger deployment
git push origin main
```

- **Vercel** will auto-deploy frontend (2-3 minutes)
- **Render** will auto-deploy backend (3-5 minutes)

## 🔍 How to Debug

### Step 1: Check Browser Console
1. Open the app in Telegram
2. Press F12 (or right-click → Inspect)
3. Go to **Console** tab
4. Try to create a visit
5. Look for `[API Error]` or `[Network Error]` messages

### Step 2: Check Network Tab
1. Open DevTools (F12)
2. Go to **Network** tab
3. Try to create a visit
4. Find the request to `/patients/{id}/visits`
5. Check:
   - **Status Code:** Should be 201 (Created)
   - **Response:** Look for error details
   - **Request URL:** Should be `https://smilecrm.onrender.com/api/patients/{id}/visits`

### Step 3: Test Backend Directly
Open these URLs in your browser:

1. **Health Check:**
   ```
   https://smilecrm.onrender.com/health
   ```
   Should return: `{"status":"ok"}`

2. **Get Patients (requires auth):**
   ```
   https://smilecrm.onrender.com/api/patients
   ```
   Should return 401 Unauthorized (this is correct - means API is working)

### Step 4: Check Render Logs
1. Go to https://dashboard.render.com
2. Select your backend service
3. Click **Logs** tab
4. Try to create a visit in the app
5. Look for error messages in the logs

## 📝 Expected Request Format

The frontend sends:
```json
POST /api/patients/{patient_id}/visits
{
  "visit_date": "2025-12-05",
  "next_visit_date": "2025-12-07",
  "notes": "Some notes"
}
```

The backend expects (in Pydantic model):
```python
class VisitCreateRequest(BaseModel):
  visit_date: date  # Automatically parses "YYYY-MM-DD" format
  next_visit_date: date | None = None
  notes: str | None = None
```

## ✅ Quick Test After Deploy

1. Wait 5 minutes for deployments to complete
2. Open the app through Telegram bot (@SmileCRM_bot)
3. Navigate to any patient
4. Open Browser DevTools (F12) → Console tab
5. Try to create a visit with:
   - Visit Date: Today's date
   - Next Visit: Future date
   - Notes: "Test visit"
6. If still error, check the console logs for detailed error message
7. Share the console error message for further debugging

## 🆘 If Still Not Working

Please check and provide:
1. Browser console error messages (F12 → Console)
2. Network tab request details (F12 → Network)
3. Backend logs from Render dashboard
4. Screenshot of Vercel environment variables

---

**Changes Made:**
- ✅ Improved error handling in `PatientDetailsPage.tsx`
- ✅ Added request logging in `client.ts`
- ✅ Added 30-second timeout
- ✅ Better error messages for users

