-- Migration 025: Add gender column to patients table
-- Created: 2026-01-04

ALTER TABLE patients
ADD COLUMN IF NOT EXISTS gender TEXT;

COMMENT ON COLUMN patients.gender IS 'Patient gender: male, female';

-- Create index for gender filtering (useful for holiday notifications)
CREATE INDEX IF NOT EXISTS idx_patients_gender
  ON patients (gender) WHERE gender IS NOT NULL;

