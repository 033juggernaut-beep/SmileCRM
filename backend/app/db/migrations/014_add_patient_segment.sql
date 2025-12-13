-- Migration 014: Add patient segment for VIP/regular classification
-- Created: 2025-12-13

-- Add segment field to patients table
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS segment TEXT NOT NULL DEFAULT 'regular';

COMMENT ON COLUMN patients.segment IS 'Patient segment: regular, vip';

-- Create index for segment filtering
CREATE INDEX IF NOT EXISTS idx_patients_segment
  ON patients (segment);
