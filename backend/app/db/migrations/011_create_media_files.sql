-- Media Files Table Migration
-- Run this SQL in Supabase SQL Editor to create media_files table and storage bucket

-- ============================================================
-- Table: media_files
-- ============================================================
CREATE TABLE IF NOT EXISTS media_files (
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

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_media_files_patient_id ON media_files(patient_id);
CREATE INDEX IF NOT EXISTS idx_media_files_doctor_id ON media_files(doctor_id);
CREATE INDEX IF NOT EXISTS idx_media_files_created_at ON media_files(created_at);

-- Enable Row Level Security
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- RLS Policy for service_role
CREATE POLICY "Service role has full access to media_files"
  ON media_files
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Storage Bucket Creation (Run separately in Supabase Dashboard)
-- ============================================================
-- Go to: Storage > Create new bucket
-- Bucket name: media
-- Public bucket: false (keep private)
-- File size limit: 10 MB
-- Allowed MIME types: image/jpeg, image/png, image/jpg, image/webp

-- ============================================================
-- Storage RLS Policies (Run after bucket creation)
-- ============================================================
-- Note: Run these in Supabase SQL Editor after creating the bucket

-- Allow service_role to upload files
CREATE POLICY "Service role can upload to media bucket"
  ON storage.objects FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'media');

-- Allow service_role to read files
CREATE POLICY "Service role can read from media bucket"
  ON storage.objects FOR SELECT
  TO service_role
  USING (bucket_id = 'media');

-- Allow service_role to delete files
CREATE POLICY "Service role can delete from media bucket"
  ON storage.objects FOR DELETE
  TO service_role
  USING (bucket_id = 'media');

