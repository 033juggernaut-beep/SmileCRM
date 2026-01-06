-- Migration 027: Enable RLS on notifications and treatment_plan_items
-- This adds defense-in-depth security layer
-- Backend uses service_role which bypasses RLS, so this won't break anything

-- ============================================================
-- Step 1: Enable RLS on notifications table
-- ============================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Service role (backend) has full access
DROP POLICY IF EXISTS "Service role has full access to notifications" ON notifications;
CREATE POLICY "Service role has full access to notifications"
  ON notifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Doctors can only see their own notifications (for direct Supabase access if ever used)
DROP POLICY IF EXISTS "Doctors can view their own notifications" ON notifications;
CREATE POLICY "Doctors can view their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (doctor_id = auth.uid()::uuid);

-- ============================================================
-- Step 2: Enable RLS on treatment_plan_items table
-- ============================================================
ALTER TABLE treatment_plan_items ENABLE ROW LEVEL SECURITY;

-- Service role (backend) has full access
DROP POLICY IF EXISTS "Service role has full access to treatment_plan_items" ON treatment_plan_items;
CREATE POLICY "Service role has full access to treatment_plan_items"
  ON treatment_plan_items
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Doctors can only see their own treatment plan items (for direct Supabase access if ever used)
DROP POLICY IF EXISTS "Doctors can view their own treatment_plan_items" ON treatment_plan_items;
CREATE POLICY "Doctors can view their own treatment_plan_items"
  ON treatment_plan_items
  FOR SELECT
  TO authenticated
  USING (doctor_id = auth.uid()::uuid);

-- ============================================================
-- Verification
-- ============================================================
-- Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('notifications', 'treatment_plan_items');

