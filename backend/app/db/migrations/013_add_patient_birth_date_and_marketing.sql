-- Migration 013: Add patient birth_date and marketing events table
-- Created: 2025-12-13

-- 1. Add birth_date field to patients table
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS birth_date DATE;

COMMENT ON COLUMN patients.birth_date IS 'Patient date of birth for birthday greetings';

-- 2. Add marketing opt-in field for future consent tracking
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN patients.marketing_opt_in IS 'Patient consent for marketing communications';

-- 3. Create patient_marketing_events table for logging marketing actions
CREATE TABLE IF NOT EXISTS patient_marketing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'copy',
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE patient_marketing_events IS 'Log of marketing events for tracking patient interactions';
COMMENT ON COLUMN patient_marketing_events.doctor_id IS 'Doctor who initiated the marketing action';
COMMENT ON COLUMN patient_marketing_events.patient_id IS 'Patient who received the marketing message';
COMMENT ON COLUMN patient_marketing_events.type IS 'Type of marketing event: birthday_greeting, promo_offer, recall_reminder';
COMMENT ON COLUMN patient_marketing_events.channel IS 'Channel used: copy (clipboard), telegram (future)';
COMMENT ON COLUMN patient_marketing_events.payload IS 'JSON payload with message text, discount percentage, etc.';

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_patient_marketing_events_doctor_id
  ON patient_marketing_events (doctor_id);

CREATE INDEX IF NOT EXISTS idx_patient_marketing_events_patient_id
  ON patient_marketing_events (patient_id);

CREATE INDEX IF NOT EXISTS idx_patient_marketing_events_type
  ON patient_marketing_events (type);

CREATE INDEX IF NOT EXISTS idx_patient_marketing_events_created_at
  ON patient_marketing_events (created_at DESC);

-- Index for birthday queries (month/day lookups)
CREATE INDEX IF NOT EXISTS idx_patients_birth_date_month_day
  ON patients (EXTRACT(MONTH FROM birth_date), EXTRACT(DAY FROM birth_date))
  WHERE birth_date IS NOT NULL;

-- 5. Add RLS (Row Level Security) policies for patient_marketing_events
ALTER TABLE patient_marketing_events ENABLE ROW LEVEL SECURITY;

-- Policy: Doctors can only see their own marketing events
CREATE POLICY patient_marketing_events_doctor_access ON patient_marketing_events
  FOR ALL
  USING (doctor_id = auth.uid()::uuid);

-- Grant permissions (adjust based on your existing role setup)
-- GRANT ALL ON patient_marketing_events TO service_role;
-- GRANT ALL ON patient_marketing_events TO authenticated;
