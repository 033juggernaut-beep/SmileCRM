-- Migration 020: Create treatment_plan_items table
-- Created: 2025-12-25
-- Purpose: Store treatment plan items (steps) for patients

-- Create treatment_plan_items table
CREATE TABLE IF NOT EXISTS treatment_plan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    price_amd DECIMAL(12, 2) DEFAULT 0,
    is_done BOOLEAN DEFAULT FALSE,
    tooth TEXT,  -- optional tooth number/location
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_treatment_plan_items_patient ON treatment_plan_items(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plan_items_doctor ON treatment_plan_items(doctor_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plan_items_patient_order ON treatment_plan_items(patient_id, sort_order);

-- Comments
COMMENT ON TABLE treatment_plan_items IS 'Treatment plan items (steps) for patients';
COMMENT ON COLUMN treatment_plan_items.patient_id IS 'Patient this treatment step belongs to';
COMMENT ON COLUMN treatment_plan_items.doctor_id IS 'Doctor who created this step';
COMMENT ON COLUMN treatment_plan_items.title IS 'Description of the treatment step';
COMMENT ON COLUMN treatment_plan_items.price_amd IS 'Price in AMD (Armenian Dram)';
COMMENT ON COLUMN treatment_plan_items.is_done IS 'Whether this step has been completed';
COMMENT ON COLUMN treatment_plan_items.tooth IS 'Optional tooth number or location';
COMMENT ON COLUMN treatment_plan_items.sort_order IS 'Order of items in the list';

