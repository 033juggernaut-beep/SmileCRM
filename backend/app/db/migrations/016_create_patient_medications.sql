-- Migration 016: Create patient_medications table
-- Created: 2024-12-24

-- 1. Create patient_medications table for tracking prescribed medications
CREATE TABLE IF NOT EXISTS patient_medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE patient_medications IS 'Medications prescribed to patients by doctors';
COMMENT ON COLUMN patient_medications.patient_id IS 'Patient who received the prescription';
COMMENT ON COLUMN patient_medications.doctor_id IS 'Doctor who prescribed the medication';
COMMENT ON COLUMN patient_medications.name IS 'Name of the medication';
COMMENT ON COLUMN patient_medications.dosage IS 'Dosage instructions (e.g., 500mg twice daily)';
COMMENT ON COLUMN patient_medications.comment IS 'Additional notes from the doctor';

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_patient_medications_patient_id
  ON patient_medications (patient_id);

CREATE INDEX IF NOT EXISTS idx_patient_medications_doctor_id
  ON patient_medications (doctor_id);

CREATE INDEX IF NOT EXISTS idx_patient_medications_created_at
  ON patient_medications (created_at DESC);

-- 3. Add RLS (Row Level Security) policies
ALTER TABLE patient_medications ENABLE ROW LEVEL SECURITY;

-- Policy: Doctors can only see medications they prescribed
CREATE POLICY patient_medications_doctor_access ON patient_medications
  FOR ALL
  USING (doctor_id = auth.uid()::uuid);

-- Grant permissions (adjust based on your existing role setup)
-- GRANT ALL ON patient_medications TO service_role;
-- GRANT ALL ON patient_medications TO authenticated;

