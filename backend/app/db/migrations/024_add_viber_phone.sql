-- Migration 024: Add viber_phone column to patients table
-- Created: 2025-12-26

-- Add viber_phone column
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS viber_phone TEXT;

-- Add a comment explaining the column
COMMENT ON COLUMN patients.viber_phone IS 'Viber phone number for the patient';

