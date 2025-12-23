-- Migration 013: Add AI usage daily tracking table
-- Created: 2025-12-23
-- Purpose: Track daily AI assistant request limits per doctor

-- Create ai_usage_daily table
CREATE TABLE IF NOT EXISTS ai_usage_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one row per doctor per day
  UNIQUE (doctor_id, day)
);

-- Add comments
COMMENT ON TABLE ai_usage_daily IS 'Tracks daily AI assistant request counts per doctor';
COMMENT ON COLUMN ai_usage_daily.doctor_id IS 'Doctor who made the requests';
COMMENT ON COLUMN ai_usage_daily.day IS 'Date of usage (YYYY-MM-DD)';
COMMENT ON COLUMN ai_usage_daily.count IS 'Number of AI requests made on this day';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_usage_daily_doctor_id
  ON ai_usage_daily (doctor_id);

CREATE INDEX IF NOT EXISTS idx_ai_usage_daily_day
  ON ai_usage_daily (day DESC);

CREATE INDEX IF NOT EXISTS idx_ai_usage_daily_doctor_day
  ON ai_usage_daily (doctor_id, day);

-- Enable Row Level Security
ALTER TABLE ai_usage_daily ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Service role has full access
CREATE POLICY "Service role has full access to ai_usage_daily"
  ON ai_usage_daily
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Optional: Auto-cleanup old records (older than 90 days)
-- This can be run periodically via a scheduled job
-- DELETE FROM ai_usage_daily WHERE day < CURRENT_DATE - INTERVAL '90 days';

