-- Migration 017: Add messaging fields to patients
-- Created: 2024-12-24

-- Add telegram_user_id, telegram_username and whatsapp_phone for direct messaging
ALTER TABLE patients ADD COLUMN IF NOT EXISTS telegram_user_id BIGINT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS telegram_username TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS whatsapp_phone TEXT;

COMMENT ON COLUMN patients.telegram_user_id IS 'Patient Telegram user ID for bot messaging';
COMMENT ON COLUMN patients.telegram_username IS 'Patient Telegram username (without @) for direct messaging';
COMMENT ON COLUMN patients.whatsapp_phone IS 'Patient WhatsApp phone number for direct messaging';

-- Update notifications table to support new notification types and statuses
-- Add status column if not exists (for read/dismissed/done states)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'unread';

-- Add patient_id column for patient-related notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES patients(id) ON DELETE SET NULL;

-- Add action_type and action_payload for actionable notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_type TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_payload JSONB;

-- Update type constraint to include new types
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type IN ('visit_reminder', 'trial_warning', 'no_show', 'info', 'birthday', 'inactive_6m'));

-- Add index for patient-related notifications
CREATE INDEX IF NOT EXISTS idx_notifications_patient_id ON notifications(patient_id) WHERE patient_id IS NOT NULL;

-- Add index for status filtering
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(doctor_id, status);

COMMENT ON COLUMN notifications.status IS 'Notification status: unread, read, dismissed, done';
COMMENT ON COLUMN notifications.patient_id IS 'Related patient ID for patient-specific notifications';
COMMENT ON COLUMN notifications.action_type IS 'Action type: generate_message, open_patient, etc.';
COMMENT ON COLUMN notifications.action_payload IS 'JSON payload for the action (template, patientId, etc.)';

