-- Migration: Add 'completed_inactive' to notifications type constraint
-- This type is used for patients with status='completed' who haven't visited for a while

ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type IN (
    'visit_reminder', 
    'trial_warning', 
    'no_show', 
    'info', 
    'birthday', 
    'inactive_6m',
    'completed_inactive'
  ));

