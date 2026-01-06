-- ============================================
-- SmileCRM - All pending migrations
-- Run this in Supabase SQL Editor
-- ============================================

-- Migration 014: Add patient segment
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS segment TEXT DEFAULT 'regular';

UPDATE patients SET segment = 'regular' WHERE segment IS NULL;

-- Migration 021: Add patient notes
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Migration 022: Ensure segment column
ALTER TABLE patients
ALTER COLUMN segment SET DEFAULT 'regular';

-- Migration 023: Notification fields
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'unread';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES patients(id) ON DELETE SET NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_type TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_payload JSONB;

-- Migration 024: Add viber_phone
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS viber_phone TEXT;

-- Migration 025: Add gender
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS gender TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_patients_segment ON patients (segment);
CREATE INDEX IF NOT EXISTS idx_patients_gender ON patients (gender) WHERE gender IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(doctor_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_patient ON notifications(patient_id) WHERE patient_id IS NOT NULL;

-- ============================================
-- Migration 026: Create clinics table and relations
-- ============================================

-- Step 1: Create clinics table
CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clinics_name ON clinics(name);

-- Step 2: Add clinic_id to doctors
ALTER TABLE doctors 
  ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_doctors_clinic_id ON doctors(clinic_id);

-- Step 3: Backfill clinic_id from existing clinic_name
-- 3.1: Create clinics from distinct clinic_name values
INSERT INTO clinics (id, name)
SELECT 
  gen_random_uuid(),
  clinic_name
FROM doctors
WHERE clinic_name IS NOT NULL 
  AND TRIM(clinic_name) != ''
GROUP BY clinic_name
ON CONFLICT DO NOTHING;

-- 3.2: Update doctors to reference their clinic
UPDATE doctors d
SET clinic_id = c.id
FROM clinics c
WHERE d.clinic_name IS NOT NULL 
  AND TRIM(d.clinic_name) != ''
  AND d.clinic_name = c.name
  AND d.clinic_id IS NULL;

-- 3.3: For doctors without clinic_name, create personal clinics
INSERT INTO clinics (id, name)
SELECT 
  gen_random_uuid(),
  'Клиника Dr. ' || first_name || COALESCE(' ' || last_name, '')
FROM doctors
WHERE (clinic_name IS NULL OR TRIM(clinic_name) = '')
  AND clinic_id IS NULL;

-- 3.4: Link orphan doctors to their personal clinics
UPDATE doctors d
SET clinic_id = c.id
FROM clinics c
WHERE (d.clinic_name IS NULL OR TRIM(d.clinic_name) = '')
  AND d.clinic_id IS NULL
  AND c.name = 'Клиника Dr. ' || d.first_name || COALESCE(' ' || d.last_name, '');

-- Step 4: Create patient_list_view
CREATE OR REPLACE VIEW patient_list_view AS
SELECT 
  p.id,
  p.doctor_id,
  p.first_name,
  p.last_name,
  p.diagnosis,
  p.phone,
  p.status,
  p.segment,
  p.gender,
  p.birth_date,
  p.notes,
  p.treatment_plan_total,
  p.treatment_plan_currency,
  p.telegram_username,
  p.whatsapp_phone,
  p.viber_phone,
  p.marketing_opt_in,
  p.created_at,
  d.first_name AS doctor_first_name,
  d.last_name AS doctor_last_name,
  TRIM(COALESCE(d.first_name, '') || ' ' || COALESCE(d.last_name, '')) AS doctor_full_name,
  d.clinic_id,
  c.name AS clinic_name
FROM patients p
LEFT JOIN doctors d ON p.doctor_id = d.id
LEFT JOIN clinics c ON d.clinic_id = c.id;

-- Step 5: Enable RLS on clinics
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists, then create (PostgreSQL doesn't support IF NOT EXISTS for policies)
DROP POLICY IF EXISTS "Service role has full access to clinics" ON clinics;
CREATE POLICY "Service role has full access to clinics"
  ON clinics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Verify columns exist
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'patients' 
ORDER BY ordinal_position;

