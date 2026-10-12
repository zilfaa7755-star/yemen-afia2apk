/*
# Create blood_search_requests table

1. New Tables
- `blood_search_requests` — stores patient blood search requests with blood type, component type, urgency, and status
- `blood_bank_inventory` — stores blood bank inventory with availability status per blood type/component
2. Security
- Enable RLS on both tables.
- Allow anon + authenticated CRUD since the app uses demo/no-auth mode.
3. Purpose
- When a patient searches for blood, a request is stored and blood banks can respond.
- Blood banks can manage their inventory (available units per blood type and component).
*/

CREATE TABLE IF NOT EXISTS blood_search_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id text NOT NULL,
  patient_name text,
  patient_phone text,
  blood_type text NOT NULL,
  component_type text NOT NULL DEFAULT 'whole',
  urgency text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'active',
  matched_blood_bank text,
  matched_units integer,
  matched_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blood_search_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_blood_requests" ON blood_search_requests;
CREATE POLICY "anon_select_blood_requests" ON blood_search_requests FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_blood_requests" ON blood_search_requests;
CREATE POLICY "anon_insert_blood_requests" ON blood_search_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_blood_requests" ON blood_search_requests;
CREATE POLICY "anon_update_blood_requests" ON blood_search_requests FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS blood_bank_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blood_bank_name text NOT NULL,
  blood_bank_address text,
  blood_bank_phone text,
  blood_type text NOT NULL,
  component_type text NOT NULL DEFAULT 'whole',
  units_available integer NOT NULL DEFAULT 0,
  is_available boolean NOT NULL DEFAULT false,
  working_hours text,
  distance_km numeric,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blood_bank_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_blood_inventory" ON blood_bank_inventory;
CREATE POLICY "anon_select_blood_inventory" ON blood_bank_inventory FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_blood_inventory" ON blood_bank_inventory;
CREATE POLICY "anon_insert_blood_inventory" ON blood_bank_inventory FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_blood_inventory" ON blood_bank_inventory;
CREATE POLICY "anon_update_blood_inventory" ON blood_bank_inventory FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Seed demo blood bank inventory
INSERT INTO blood_bank_inventory (blood_bank_name, blood_bank_address, blood_bank_phone, blood_type, component_type, units_available, is_available, working_hours, distance_km)
VALUES
  ('بنك الدم المركزي - مستشفى الثورة', 'صنعاء - شارع الخمسين', '01-789012', 'O+', 'whole', 4, true, '24 ساعة', 1.2),
  ('بنك الدم المركزي - مستشفى الثورة', 'صنعاء - شارع الخمسين', '01-789012', 'A+', 'whole', 2, true, '24 ساعة', 1.2),
  ('بنك الدم - مستشفى الكويتي', 'صنعاء - الستين', '01-567890', 'O+', 'red', 2, true, '8ص - 8م', 1.8),
  ('بنك دم الجمهورية', 'صنعاء - حدة', '01-234567', 'B+', 'platelets', 0, false, '7ص - 9م', 2.5),
  ('بنك الدم - مجمع الحياة', 'صنعاء - شارع تونس', '01-667788', 'AB+', 'plasma', 3, true, '8ص - 6م', 3.1),
  ('بنك الدم - مستشفى السعودي', 'صنعاء - شارع الزبيري', '01-334455', 'O-', 'whole', 1, true, '8ص - 10م', 4.0)
ON CONFLICT DO NOTHING;
