-- Migration 022: Fix patient segment column
-- Created: 2025-12-25
-- Purpose: Ensure segment column exists and has proper default values

-- 1. Ensure the segment column exists with proper default
ALTER TABLE patients ADD COLUMN IF NOT EXISTS segment TEXT DEFAULT 'regular';

-- 2. Update any NULL segments to 'regular' 
UPDATE patients SET segment = 'regular' WHERE segment IS NULL;

-- 3. Add NOT NULL constraint (if not already present)
-- Note: We don't add NOT NULL because it might fail if there's legacy data

-- 4. Add index for segment filtering
CREATE INDEX IF NOT EXISTS idx_patients_segment ON patients(segment);

-- 5. Ensure column comment
COMMENT ON COLUMN patients.segment IS 'Patient segment: regular, vip';

