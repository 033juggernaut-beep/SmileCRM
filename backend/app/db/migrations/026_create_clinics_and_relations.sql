-- Migration 026: Create clinics table and establish Clinic → Doctor → Patients hierarchy
-- This migration enables multi-clinic, multi-doctor support while preserving existing single-doctor flow

-- ============================================================
-- Step 1: Create clinics table
-- ============================================================
CREATE TABLE IF NOT EXISTS clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_clinics_name ON clinics(name);

-- ============================================================
-- Step 2: Add clinic_id to doctors table
-- ============================================================
ALTER TABLE doctors 
  ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id) ON DELETE SET NULL;

-- Create index on doctors(clinic_id) for faster joins
CREATE INDEX IF NOT EXISTS idx_doctors_clinic_id ON doctors(clinic_id);

-- ============================================================
-- Step 3: Backfill clinic_id from existing clinic_name
-- For each distinct non-null, non-empty clinic_name:
--   1. Create a clinic row
--   2. Update doctors to reference that clinic
-- For doctors with null/empty clinic_name, create a personal clinic
-- ============================================================

-- Step 3.1: Create clinics from distinct clinic_name values (non-null, non-empty)
INSERT INTO clinics (id, name)
SELECT 
  gen_random_uuid(),
  clinic_name
FROM doctors
WHERE clinic_name IS NOT NULL 
  AND TRIM(clinic_name) != ''
GROUP BY clinic_name
ON CONFLICT DO NOTHING;

-- Step 3.2: Update doctors to reference their clinic by clinic_name match
UPDATE doctors d
SET clinic_id = c.id
FROM clinics c
WHERE d.clinic_name IS NOT NULL 
  AND TRIM(d.clinic_name) != ''
  AND d.clinic_name = c.name
  AND d.clinic_id IS NULL;

-- Step 3.3: For doctors without clinic_name, create personal clinics
-- Pattern: "Клиника Dr. {first_name} {last_name}"
INSERT INTO clinics (id, name)
SELECT 
  gen_random_uuid(),
  'Клиника Dr. ' || first_name || COALESCE(' ' || last_name, '')
FROM doctors
WHERE (clinic_name IS NULL OR TRIM(clinic_name) = '')
  AND clinic_id IS NULL;

-- Step 3.4: Link orphan doctors to their personal clinics
-- This is done by matching the generated clinic name pattern
UPDATE doctors d
SET clinic_id = c.id
FROM clinics c
WHERE (d.clinic_name IS NULL OR TRIM(d.clinic_name) = '')
  AND d.clinic_id IS NULL
  AND c.name = 'Клиника Dr. ' || d.first_name || COALESCE(' ' || d.last_name, '');

-- ============================================================
-- Step 4: Create patient_list_view for easier frontend queries
-- Joins patients + doctors + clinics for complete patient info
-- ============================================================
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
  -- Doctor info
  d.first_name AS doctor_first_name,
  d.last_name AS doctor_last_name,
  TRIM(COALESCE(d.first_name, '') || ' ' || COALESCE(d.last_name, '')) AS doctor_full_name,
  d.clinic_id,
  -- Clinic info
  c.name AS clinic_name
FROM patients p
LEFT JOIN doctors d ON p.doctor_id = d.id
LEFT JOIN clinics c ON d.clinic_id = c.id;

-- ============================================================
-- Step 5: Enable RLS on clinics table
-- ============================================================
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access to clinics
-- (DROP first to make migration idempotent - PostgreSQL doesn't support IF NOT EXISTS for policies)
DROP POLICY IF EXISTS "Service role has full access to clinics" ON clinics;
CREATE POLICY "Service role has full access to clinics"
  ON clinics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Step 6: Add RLS policies for doctor-specific access
-- These policies use the JWT claim to identify the current doctor
-- Note: The backend uses service_role, so these are for direct API access
-- ============================================================

-- Doctors can only see their own clinic
DROP POLICY IF EXISTS "Doctors can view their own clinic" ON clinics;
CREATE POLICY "Doctors can view their own clinic"
  ON clinics
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT clinic_id FROM doctors 
      WHERE telegram_user_id = (current_setting('request.jwt.claims', true)::json->>'telegram_user_id')::bigint
    )
  );

-- Doctors can only see their own doctor record
DROP POLICY IF EXISTS "Doctors can view their own record" ON doctors;
CREATE POLICY "Doctors can view their own record"
  ON doctors
  FOR SELECT
  TO authenticated
  USING (
    telegram_user_id = (current_setting('request.jwt.claims', true)::json->>'telegram_user_id')::bigint
  );

-- Doctors can only see patients assigned to them
DROP POLICY IF EXISTS "Doctors can view their own patients" ON patients;
CREATE POLICY "Doctors can view their own patients"
  ON patients
  FOR SELECT
  TO authenticated
  USING (
    doctor_id IN (
      SELECT id FROM doctors 
      WHERE telegram_user_id = (current_setting('request.jwt.claims', true)::json->>'telegram_user_id')::bigint
    )
  );

-- ============================================================
-- Verification query (uncomment to run manually)
-- ============================================================
-- SELECT 
--   d.id as doctor_id,
--   d.first_name,
--   d.last_name,
--   d.clinic_name as old_clinic_name,
--   d.clinic_id,
--   c.name as new_clinic_name
-- FROM doctors d
-- LEFT JOIN clinics c ON d.clinic_id = c.id
-- ORDER BY d.created_at;

