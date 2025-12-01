-- Migration 012: Add medications to visits, diagnosis to patients, and patient finance tracking
-- Created: 2025-12-01

-- 1. Add medications field to visits table
ALTER TABLE visits
ADD COLUMN IF NOT EXISTS medications TEXT;

COMMENT ON COLUMN visits.medications IS 'Medications prescribed during this visit with dosage instructions';

-- 2. Ensure diagnosis field exists on patients table
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS diagnosis TEXT;

COMMENT ON COLUMN patients.diagnosis IS 'Primary diagnosis for the patient';

-- 3. Add treatment plan financial fields to patients table
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS treatment_plan_total NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS treatment_plan_currency TEXT DEFAULT 'AMD';

COMMENT ON COLUMN patients.treatment_plan_total IS 'Total cost of the treatment plan for this patient';
COMMENT ON COLUMN patients.treatment_plan_currency IS 'Currency for treatment plan (default AMD)';

-- 4. Create patient_payments table for tracking partial payments
CREATE TABLE IF NOT EXISTS patient_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  visit_id UUID REFERENCES visits(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'AMD',
  paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE patient_payments IS 'Tracks partial payments for patient treatment plans';
COMMENT ON COLUMN patient_payments.patient_id IS 'Patient who made the payment';
COMMENT ON COLUMN patient_payments.doctor_id IS 'Doctor who received/recorded the payment';
COMMENT ON COLUMN patient_payments.visit_id IS 'Optional: visit during which payment was made';
COMMENT ON COLUMN patient_payments.amount IS 'Payment amount';
COMMENT ON COLUMN patient_payments.paid_at IS 'When the payment was made';
COMMENT ON COLUMN patient_payments.comment IS 'Optional note about this payment';

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_patient_payments_patient_id
  ON patient_payments (patient_id);

CREATE INDEX IF NOT EXISTS idx_patient_payments_doctor_id
  ON patient_payments (doctor_id);

CREATE INDEX IF NOT EXISTS idx_patient_payments_visit_id
  ON patient_payments (visit_id)
  WHERE visit_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_patient_payments_paid_at
  ON patient_payments (paid_at DESC);

-- 6. Add RLS (Row Level Security) policies for patient_payments
ALTER TABLE patient_payments ENABLE ROW LEVEL SECURITY;

-- Policy: Doctors can only see payments for their own patients
CREATE POLICY patient_payments_doctor_access ON patient_payments
  FOR ALL
  USING (doctor_id = auth.uid()::uuid);

-- Grant permissions (adjust based on your existing role setup)
-- If you have a service role, grant it full access
-- GRANT ALL ON patient_payments TO service_role;
-- GRANT ALL ON patient_payments TO authenticated;

