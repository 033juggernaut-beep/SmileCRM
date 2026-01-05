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

-- Verify columns exist
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'patients' 
ORDER BY ordinal_position;

