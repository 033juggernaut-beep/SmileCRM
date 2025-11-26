-- SmileCRM Database Schema for Supabase
-- Run this SQL in Supabase SQL Editor to create all required tables

-- ============================================================
-- Table: doctors
-- ============================================================
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id BIGINT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  specialization TEXT,
  phone TEXT,
  clinic_name TEXT,
  trial_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  subscription_status TEXT DEFAULT 'trial',
  subscription_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on telegram_user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_doctors_telegram_user_id ON doctors(telegram_user_id);

-- ============================================================
-- Table: patients
-- ============================================================
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  diagnosis TEXT,
  phone TEXT,
  status TEXT DEFAULT 'in_progress',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on doctor_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_patients_doctor_id ON patients(doctor_id);

-- ============================================================
-- Table: visits
-- ============================================================
CREATE TABLE IF NOT EXISTS visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  next_visit_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_visits_doctor_id ON visits(doctor_id);
CREATE INDEX IF NOT EXISTS idx_visits_patient_id ON visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_visit_date ON visits(visit_date);

-- ============================================================
-- Table: payments
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  external_payment_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AMD',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on doctor_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_doctor_id ON payments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_payments_external_payment_id ON payments(external_payment_id);

-- ============================================================
-- Enable Row Level Security (RLS)
-- ============================================================
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies (allow service_role to do everything)
-- ============================================================

-- Doctors policies
CREATE POLICY "Service role has full access to doctors"
  ON doctors
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Patients policies
CREATE POLICY "Service role has full access to patients"
  ON patients
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Visits policies
CREATE POLICY "Service role has full access to visits"
  ON visits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Payments policies
CREATE POLICY "Service role has full access to payments"
  ON payments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

