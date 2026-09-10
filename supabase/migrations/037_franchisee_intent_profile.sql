-- Promote franchisee_details to the canonical franchisee requirement / intent profile.
-- Matching reads this table, not profiles.role.

ALTER TABLE public.franchisee_details
  ADD COLUMN IF NOT EXISTS funding_method TEXT,
  ADD COLUMN IF NOT EXISTS owner_operated BOOLEAN,
  ADD COLUMN IF NOT EXISTS preferred_formats JSONB,
  ADD COLUMN IF NOT EXISTS property_required BOOLEAN,
  ADD COLUMN IF NOT EXISTS preferred_property_type TEXT,
  ADD COLUMN IF NOT EXISTS space_available NUMERIC,
  ADD COLUMN IF NOT EXISTS preferred_cities JSONB,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS liquid_capital NUMERIC,
  ADD COLUMN IF NOT EXISTS net_worth NUMERIC,
  ADD COLUMN IF NOT EXISTS time_commitment TEXT,
  ADD COLUMN IF NOT EXISTS management_experience_years NUMERIC;

COMMENT ON TABLE public.franchisee_details IS
  'Canonical franchisee requirement / intent profile used by matching and enquire';
