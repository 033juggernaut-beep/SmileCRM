-- Migration 018: Add extended fields to visits table
-- Created: 2024-12-25
-- Feature: Visits Today + Status management + Reminders

-- ============================================
-- VISITS TABLE EXTENSIONS
-- ============================================

-- Add visit time (optional, for scheduling)
ALTER TABLE visits ADD COLUMN IF NOT EXISTS visit_time TIME;

-- Add visit status with enum values
ALTER TABLE visits ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled';
ALTER TABLE visits ADD CONSTRAINT visits_status_check 
  CHECK (status IN ('scheduled', 'in_progress', 'completed', 'no_show', 'rescheduled'));

-- Add status tracking fields
ALTER TABLE visits ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMPTZ;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS status_note TEXT;

-- Add rescheduling fields
ALTER TABLE visits ADD COLUMN IF NOT EXISTS rescheduled_to DATE;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS rescheduled_time TIME;

-- Add reminder tracking fields
ALTER TABLE visits ADD COLUMN IF NOT EXISTS reminder_status TEXT DEFAULT 'pending';
ALTER TABLE visits ADD CONSTRAINT visits_reminder_status_check 
  CHECK (reminder_status IN ('pending', 'sent', 'failed', 'skipped'));

ALTER TABLE visits ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS reminder_channel TEXT;
ALTER TABLE visits ADD CONSTRAINT visits_reminder_channel_check 
  CHECK (reminder_channel IS NULL OR reminder_channel IN ('telegram', 'whatsapp'));

-- Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_visits_doctor_date ON visits(doctor_id, visit_date);
CREATE INDEX IF NOT EXISTS idx_visits_status ON visits(status);
CREATE INDEX IF NOT EXISTS idx_visits_reminder_status ON visits(reminder_status) 
  WHERE reminder_status = 'pending';

-- Comments
COMMENT ON COLUMN visits.visit_time IS 'Optional time of the visit (HH:MM:SS)';
COMMENT ON COLUMN visits.status IS 'Visit status: scheduled, in_progress, completed, no_show, rescheduled';
COMMENT ON COLUMN visits.status_changed_at IS 'When the status was last changed';
COMMENT ON COLUMN visits.status_note IS 'Note about status change (e.g., why patient did not show)';
COMMENT ON COLUMN visits.rescheduled_to IS 'New date if visit was rescheduled';
COMMENT ON COLUMN visits.rescheduled_time IS 'New time if visit was rescheduled';
COMMENT ON COLUMN visits.reminder_status IS 'Reminder status: pending, sent, failed, skipped';
COMMENT ON COLUMN visits.reminder_sent_at IS 'When the reminder was sent';
COMMENT ON COLUMN visits.reminder_channel IS 'Channel used for reminder: telegram, whatsapp';

-- ============================================
-- PATIENTS TABLE EXTENSIONS
-- ============================================

-- Add telegram_user_id for direct bot messaging
ALTER TABLE patients ADD COLUMN IF NOT EXISTS telegram_user_id BIGINT;

-- Index for efficient lookup by telegram_user_id
CREATE INDEX IF NOT EXISTS idx_patients_telegram_user_id ON patients(telegram_user_id) 
  WHERE telegram_user_id IS NOT NULL;

COMMENT ON COLUMN patients.telegram_user_id IS 'Telegram user ID for direct bot messaging (from patient interaction with bot)';

