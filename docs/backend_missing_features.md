# Backend Missing Features Pattern

This document describes the standard pattern for implementing backend functionality when frontend UI already exists.

## Overview

When developing SmileCRM, we sometimes create frontend UI before the backend API is ready. This pattern ensures:

1. **Frontend works in isolation** - Uses mock data when API unavailable
2. **Seamless transition** - Switches to real API automatically when available
3. **No UI changes needed** - Same components work with mock or real data
4. **Production-ready** - Auth, filtering by doctor_id, proper error handling

## Implementation Steps

### Step 1: Database Migration

Create migration file in `backend/app/db/migrations/XXX_create_<feature>.sql`:

```sql
-- Migration: Create <feature> table
CREATE TABLE IF NOT EXISTS <feature> (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    -- ... feature-specific columns
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for listing by doctor
CREATE INDEX IF NOT EXISTS idx_<feature>_doctor_created 
    ON <feature>(doctor_id, created_at DESC);
```

**Key points:**
- Always include `doctor_id` for multi-tenant filtering
- Use `ON DELETE CASCADE` for proper cleanup
- Add appropriate indexes for common queries

### Step 2: Pydantic Schemas

Create `backend/app/models/<feature>.py`:

```python
from pydantic import BaseModel, Field
from datetime import datetime

class <Feature>Out(BaseModel):
    """Single item response."""
    id: str
    doctor_id: str = Field(alias="doctorId")
    # ... fields
    created_at: datetime = Field(alias="createdAt")
    
    class Config:
        populate_by_name = True

class <Feature>ListOut(BaseModel):
    """List response."""
    items: list[<Feature>Out]
    # Optional: count, pagination, etc.
    
    class Config:
        populate_by_name = True

class Create<Feature>Request(BaseModel):
    """Create request."""
    # ... required fields
```

**Key points:**
- Use `alias` for camelCase API responses
- Set `populate_by_name = True` for flexibility
- Keep schemas focused and minimal

### Step 3: Service Layer

Create `backend/app/services/<feature>_service.py`:

```python
from .supabase_client import SupabaseNotConfiguredError, supabase_client

def list_<feature>(doctor_id: str, limit: int = 20, offset: int = 0):
    """List items for a doctor."""
    try:
        if not supabase_client.is_configured:
            return []
        # ... query logic
    except SupabaseNotConfiguredError:
        return []

def create_<feature>(doctor_id: str, **kwargs):
    """Create a new item."""
    try:
        return supabase_client.insert("<feature>", {...})
    except SupabaseNotConfiguredError:
        # Return mock for local dev
        return {"id": "mock-id", ...}
```

**Key points:**
- Handle `SupabaseNotConfiguredError` gracefully
- Always filter by `doctor_id` for security
- Return empty list/None on errors (don't crash)

### Step 4: API Router

Create `backend/app/api/<feature>.py`:

```python
from fastapi import APIRouter, Depends
from app.api.deps import AuthenticatedDoctor, get_current_doctor

router = APIRouter(prefix="/<feature>", tags=["<feature>"])
CurrentDoctor = Annotated[AuthenticatedDoctor, Depends(get_current_doctor)]

@router.get("/", response_model=<Feature>ListOut)
async def list_<feature>(current_doctor: CurrentDoctor):
    items = <feature>_service.list_<feature>(current_doctor.doctor_id)
    return <Feature>ListOut(items=[...])
```

**Key points:**
- Use `get_current_doctor` for authentication
- Access `current_doctor.doctor_id` for filtering
- Return proper response models

**Register router in `main.py`:**
```python
from app.api import <feature>
app.include_router(<feature>.router, prefix="/api")
```

### Step 5: Frontend API Module

Create `frontend/src/api/<feature>.ts`:

```typescript
import { apiClient } from './client'
import { getAuthToken } from './auth'

export interface <Feature> {
  id: string
  // ... fields
}

export async function get<Feature>s(): Promise<{items: <Feature>[], ...}> {
  const token = getAuthToken()
  const { data } = await apiClient.get('/<feature>', {
    headers: { Authorization: `Bearer ${token}` }
  })
  return data
}

export const <feature>Api = { get<Feature>s, ... }
```

### Step 6: Frontend Hook with Fallback

Create `frontend/src/hooks/use<Feature>.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react'
import { <feature>Api } from '../api/<feature>'
import { mock<Feature>s } from '../components/<feature>/mock<Feature>s'

export function use<Feature>() {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isMock, setIsMock] = useState(false)
  
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await <feature>Api.get<Feature>s()
      setItems(response.items)
      setIsMock(false)
    } catch (err) {
      // Fallback to mock data
      console.log('[use<Feature>] API unavailable, using mock')
      setItems(mock<Feature>s)
      setIsMock(true)
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  useEffect(() => { fetch() }, [fetch])
  
  return { items, isLoading, isMock, refetch: fetch }
}
```

**Key points:**
- Try API first, fallback to mock on ANY error
- Don't show error to user when falling back
- Expose `isMock` for debugging (optional UI indicator)
- Include `refetch` for manual refresh

### Step 7: Update UI Component

Replace direct mock data usage with hook:

```typescript
// Before (mock only)
import { mockItems } from './mockItems'
const [items, setItems] = useState(mockItems)

// After (API with fallback)
import { use<Feature> } from '../../hooks/use<Feature>'
const { items, mutate } = use<Feature>()
```

**Key principle:** UI component doesn't need to know if data is mock or real.

## Example: Notifications

Reference implementation in this codebase:

| Layer | File |
|-------|------|
| Migration | `backend/app/db/migrations/015_create_notifications.sql` |
| Schemas | `backend/app/models/notifications.py` |
| Service | `backend/app/services/notifications_service.py` |
| Router | `backend/app/api/notifications.py` |
| Frontend API | `frontend/src/api/notifications.ts` |
| Hook | `frontend/src/hooks/useNotifications.ts` |
| Mock Data | `frontend/src/components/notifications/mockNotifications.ts` |

## Checklist for New Features

- [ ] Database migration created
- [ ] Pydantic schemas defined
- [ ] Service with Supabase error handling
- [ ] Router with auth dependency
- [ ] Router registered in `main.py`
- [ ] Frontend API module
- [ ] Hook with try/catch fallback to mock
- [ ] UI updated to use hook
- [ ] `npm run build` passes
- [ ] Backend starts without errors

## Testing

1. **Without backend:** Frontend should show mock data
2. **With backend running:** Frontend should show real API data
3. **API returns error:** Frontend should fallback to mock gracefully

```bash
# Test backend
cd backend
python -m app.main

# Test endpoints
curl http://localhost:8000/health
curl http://localhost:8000/api/notifications -H "Authorization: Bearer <token>"

# Test frontend
cd frontend
npm run dev
npm run build
```

