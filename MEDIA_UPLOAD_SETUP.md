# Quick Setup Guide - Media Upload Feature

Follow these steps to enable the media upload feature in your SmileCRM deployment.

## Step 1: Database Migration

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your SmileCRM project
3. Go to **SQL Editor**
4. Open the file `backend/app/db/migrations/011_create_media_files.sql`
5. Copy and run the SQL commands to create the `media_files` table

## Step 2: Create Storage Bucket

1. In Supabase Dashboard, go to **Storage**
2. Click **"Create a new bucket"**
3. Configure the bucket:
   - **Name:** `media`
   - **Public bucket:** ❌ (keep it private)
   - **File size limit:** 10 MB
   - **Allowed MIME types:** `image/jpeg`, `image/png`, `image/jpg`, `image/webp`
4. Click **"Create bucket"**

## Step 3: Apply Storage Policies

1. After creating the bucket, go to **SQL Editor** again
2. Run the storage RLS policies from the migration file:
   - These allow the service role to upload, read, and delete files

## Step 4: Install Backend Dependencies (if needed)

The feature uses existing dependencies, but verify you have:

```bash
cd backend
pip install -r requirements.txt
```

## Step 5: Install Frontend Dependencies (if needed)

```bash
cd frontend
npm install
```

## Step 6: Restart Services

**Backend:**
```bash
cd backend
python -m app.main
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## Step 7: Test the Feature

1. Open your SmileCRM Mini App
2. Log in as a doctor
3. Open any patient's details page
4. Scroll down to see the new "📷 Ավելացնել նկարը" section
5. Upload an image and verify it appears in the gallery

## Verification Checklist

- ✅ `media_files` table exists in Supabase
- ✅ `media` storage bucket exists
- ✅ Storage RLS policies are applied
- ✅ Backend starts without errors
- ✅ Frontend builds without errors
- ✅ Upload section appears on patient details page
- ✅ Can upload an image successfully
- ✅ Uploaded images appear in gallery
- ✅ Can click image to view full size

## Troubleshooting

### Error: "Failed to upload file to storage bucket 'media'"

**Solution:** Verify that:
1. The `media` bucket exists in Supabase Storage
2. Storage RLS policies are applied
3. Your `SUPABASE_SERVICE_ROLE_KEY` has proper permissions

### Error: "Patient not found" when uploading

**Solution:** Verify that:
1. You're logged in as the correct doctor
2. The patient belongs to your doctor account
3. JWT token is valid

### Images not showing in gallery

**Solution:** Check:
1. Browser console for network errors
2. Supabase Storage bucket is configured correctly
3. File URLs are accessible (check in Supabase Storage UI)

### File upload size limit

The feature enforces a 10MB limit. To change this:
1. Update `MAX_FILE_SIZE` in `backend/app/api/media.py`
2. Update bucket settings in Supabase Dashboard

## Production Deployment

### Vercel (Frontend)

No additional configuration needed. The feature will work automatically once deployed.

### Render (Backend)

Ensure environment variables are set:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The backend will automatically use these for Storage operations.

## Next Steps

After successful setup:
1. Test with different image formats (JPEG, PNG, WebP)
2. Test file size validation
3. Test with multiple patients
4. Consider implementing delete functionality (see MEDIA_UPLOAD_IMPLEMENTATION.md)

## Support

If you encounter issues:
1. Check the implementation documentation: `MEDIA_UPLOAD_IMPLEMENTATION.md`
2. Review API documentation in the implementation doc
3. Check Supabase logs for storage errors
4. Check browser console for frontend errors

