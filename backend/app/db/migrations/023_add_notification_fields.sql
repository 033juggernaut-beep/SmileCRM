-- Migration 023: Add missing notification fields
-- Created: 2025-12-26
-- Purpose: Add status, patient_id, action_type, action_payload columns for enhanced notifications

-- Add status column (default 'unread')
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'unread';

-- Add patient_id for patient-related notifications  
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES patients(id) ON DELETE SET NULL;

-- Add action_type for actionable notifications (generate_message, open_patient, etc.)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_type TEXT;

-- Add action_payload for action parameters (JSON)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_payload JSONB;

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(doctor_id, status);

-- Index for patient-related notifications
CREATE INDEX IF NOT EXISTS idx_notifications_patient ON notifications(patient_id) WHERE patient_id IS NOT NULL;

-- Comments
COMMENT ON COLUMN notifications.status IS 'Notification status: unread, read, dismissed, done';
COMMENT ON COLUMN notifications.patient_id IS 'Related patient ID for patient-specific notifications';
COMMENT ON COLUMN notifications.action_type IS 'Action type: generate_message, open_patient, etc.';
COMMENT ON COLUMN notifications.action_payload IS 'JSON payload for the action (template, patientId, channel, etc.)';

