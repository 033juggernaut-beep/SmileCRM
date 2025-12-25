-- Add notes column to patients table for doctor notes
-- Migration: 021_add_patient_notes.sql

-- Add the notes column
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add a comment explaining the column
COMMENT ON COLUMN patients.notes IS 'Doctor notes for the patient - free text field';

