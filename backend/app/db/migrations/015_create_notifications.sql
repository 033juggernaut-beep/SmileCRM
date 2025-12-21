-- Migration: Create notifications table
-- Description: Stores notifications for doctors (visit reminders, trial warnings, no-shows, etc.)

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('visit_reminder', 'trial_warning', 'no_show', 'info')),
    title TEXT NOT NULL,
    body TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    read_at TIMESTAMPTZ NULL,
    meta JSONB NULL
);

-- Index for listing notifications by doctor, ordered by created_at desc
CREATE INDEX IF NOT EXISTS idx_notifications_doctor_created 
    ON notifications(doctor_id, created_at DESC);

-- Index for counting/filtering unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_doctor_read 
    ON notifications(doctor_id, read_at);

-- Comment on table
COMMENT ON TABLE notifications IS 'Doctor notifications (visit reminders, trial warnings, no-shows, system info)';

-- Comment on columns
COMMENT ON COLUMN notifications.type IS 'Notification type: visit_reminder, trial_warning, no_show, info';
COMMENT ON COLUMN notifications.read_at IS 'NULL if unread, timestamp when marked as read';
COMMENT ON COLUMN notifications.meta IS 'Additional JSON data (patient_id, visit_id, etc.)';

