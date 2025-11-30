# Media Upload Feature Implementation

This document describes the complete implementation of the media upload feature for SmileCRM Mini App, allowing doctors to upload and view patient media files (X-rays, photos).

## Overview

The feature adds:
- File upload UI in the patient details page
- Media gallery to view all patient media files
- Backend API endpoints for upload and retrieval
- Supabase Storage integration
- Image preview and validation

## Implementation Details

### 1. Database Schema (Backend)

**File:** `backend/app/db/migrations/011_create_media_files.sql`

Created the `media_files` table to store metadata about uploaded files:

```sql
CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'media',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Storage Bucket:** Created `media` bucket in Supabase Storage (private) with RLS policies.

**How to Apply:**
1. Go to Supabase Dashboard > SQL Editor
2. Run the migration SQL
3. Go to Storage > Create bucket named "media" (private, 10MB limit)
4. Run storage RLS policies from the migration file

### 2. Backend Services

#### Updated: `backend/app/services/supabase_client.py`

Added Storage operations to the SupabaseClient class:

- `upload_file()` - Upload files to Supabase Storage
- `get_file_url()` - Get public URL for a file
- `delete_file()` - Delete file from storage

#### New: `backend/app/services/media_service.py`

Service layer for media file operations:

- `upload_media_file()` - Upload media and create database record
- `list_patient_media()` - List all media files for a patient
- `delete_media_file()` - Delete media file (soft delete)

Files are stored with path: `{doctor_id}/{patient_id}/{file_id}.{extension}`

### 3. Backend API

#### Updated: `backend/app/api/media.py`

Implemented REST API endpoints:

**POST `/api/patients/{patient_id}/media`**
- Accepts multipart/form-data with file upload
- Validates file type (image/jpeg, image/png, image/webp)
- Validates file size (max 10MB)
- Requires authentication (JWT token)
- Returns media file record with public URL

**GET `/api/patients/{patient_id}/media`**
- Returns array of media files for a patient
- Includes public URLs for each file
- Requires authentication

#### Updated: `backend/app/models/dto.py`

Added `MediaFileResponse` Pydantic model for API responses.

#### Updated: `backend/app/main.py`

Media router is already registered (no changes needed).

### 4. Frontend API Client

#### New: `frontend/src/api/media.ts`

API client functions:

- `uploadPatientMedia(patientId, file)` - Upload file using FormData
- `getPatientMedia(patientId)` - Get list of media files

Handles authentication using JWT token from localStorage.

### 5. Frontend Components

#### New: `frontend/src/components/MediaGallery.tsx`

Complete media management component with:

**Upload Section:**
- File input with image/* accept
- Image preview before upload
- File size validation (10MB max)
- File type validation
- Upload progress indicator
- Success/error toast notifications

**Gallery Section:**
- Grid display of all patient media files
- Image thumbnails (150px height)
- File metadata (name, size, date)
- Click to open image in new tab
- Loading states
- Empty state

**Features:**
- Auto-refresh after successful upload
- Responsive grid layout (1-3 columns)
- Hover effects on thumbnails
- Chakra UI styling consistent with app theme

#### Updated: `frontend/src/pages/PatientDetailsPage.tsx`

Added MediaGallery component at the bottom of the patient details page, after the visit history section.

## Usage

### For Users

1. Open a patient's details page
2. Scroll to the "📷 Ավելացնել նկարը" section
3. Click "Выберите изображение" and select an image file
4. Preview the image
5. Click "Загрузить" to upload
6. View all uploaded media in the gallery below

### For Developers

**Starting the Backend:**
```bash
cd backend
python -m app.main
```

**Starting the Frontend:**
```bash
cd frontend
npm run dev
```

**Environment Variables:**
- Backend requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Frontend requires `VITE_API_BASE_URL`

## API Documentation

### Upload Media File

```http
POST /api/patients/{patient_id}/media
Content-Type: multipart/form-data
Authorization: Bearer {jwt_token}

Body:
  file: <binary>
```

**Response:**
```json
{
  "id": "uuid",
  "patient_id": "uuid",
  "doctor_id": "uuid",
  "file_name": "xray.jpg",
  "file_type": "image/jpeg",
  "file_size": 1024000,
  "storage_path": "doctor_id/patient_id/file_id.jpg",
  "storage_bucket": "media",
  "public_url": "https://...",
  "created_at": "2025-11-30T..."
}
```

### List Media Files

```http
GET /api/patients/{patient_id}/media
Authorization: Bearer {jwt_token}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "patient_id": "uuid",
    "doctor_id": "uuid",
    "file_name": "xray.jpg",
    "file_type": "image/jpeg",
    "file_size": 1024000,
    "storage_path": "doctor_id/patient_id/file_id.jpg",
    "storage_bucket": "media",
    "public_url": "https://...",
    "created_at": "2025-11-30T..."
  }
]
```

## Security

- All endpoints require JWT authentication
- Files can only be uploaded/viewed by the patient's doctor
- Patient ownership is verified on every request
- File type whitelist (only images)
- File size limit (10MB)
- RLS policies on Supabase Storage
- Files stored in private bucket

## Testing Checklist

- [ ] Upload image file successfully
- [ ] View uploaded images in gallery
- [ ] Click image to open in new tab
- [ ] Validate file type (try uploading non-image)
- [ ] Validate file size (try uploading >10MB)
- [ ] Test with multiple images
- [ ] Test responsive layout on mobile
- [ ] Verify authentication (try without token)
- [ ] Verify authorization (try accessing other doctor's patient)
- [ ] Test empty state (no media files)
- [ ] Test loading states
- [ ] Test error handling

## Future Enhancements

- Delete media files
- Add comments/notes to media files
- Filter media by date
- Download media files
- Image compression before upload
- Support for PDF files
- Bulk upload
- Image annotation tools

## Files Changed/Created

### Backend
- ✅ `backend/app/db/migrations/011_create_media_files.sql` (new)
- ✅ `backend/app/services/supabase_client.py` (updated)
- ✅ `backend/app/services/media_service.py` (new)
- ✅ `backend/app/api/media.py` (updated)
- ✅ `backend/app/models/dto.py` (updated)
- ✅ `backend/app/main.py` (no changes needed)

### Frontend
- ✅ `frontend/src/api/media.ts` (new)
- ✅ `frontend/src/components/MediaGallery.tsx` (new)
- ✅ `frontend/src/pages/PatientDetailsPage.tsx` (updated)

## Notes

- No breaking changes to existing patient/visit functionality
- All styling uses Chakra UI components consistent with existing design
- Component follows existing code patterns (Premium components, PremiumCard, etc.)
- Error handling and loading states implemented throughout
- Armenian text used in UI per existing convention ("📷 Ավելացնել նկարը")

