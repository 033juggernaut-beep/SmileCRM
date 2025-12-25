-- Migration 019: Add is_vip field to patients table
-- Created: 2025-12-25
-- Purpose: Track VIP patients for statistics and premium features

-- Add is_vip boolean field with default false
ALTER TABLE patients ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT FALSE;

-- Comment on column
COMMENT ON COLUMN patients.is_vip IS 'Whether the patient is a VIP client (premium/special care)';

-- Index for filtering VIP patients
CREATE INDEX IF NOT EXISTS idx_patients_is_vip ON patients(is_vip) WHERE is_vip = TRUE;

