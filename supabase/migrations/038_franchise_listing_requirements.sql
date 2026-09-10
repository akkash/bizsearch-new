-- Structured franchise listing requirements for matching and future VABGO location intent.
-- Grain is the franchise listing, not the franchisor profile.

ALTER TABLE public.franchises
  ADD COLUMN IF NOT EXISTS property_type TEXT,
  ADD COLUMN IF NOT EXISTS min_area_sqft INTEGER,
  ADD COLUMN IF NOT EXISTS max_area_sqft INTEGER,
  ADD COLUMN IF NOT EXISTS owner_operator_required BOOLEAN,
  ADD COLUMN IF NOT EXISTS opening_timeline TEXT,
  ADD COLUMN IF NOT EXISTS preferred_cities JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS preferred_experience TEXT,
  ADD COLUMN IF NOT EXISTS ground_floor BOOLEAN,
  ADD COLUMN IF NOT EXISTS parking_required BOOLEAN,
  ADD COLUMN IF NOT EXISTS max_rent NUMERIC,
  ADD COLUMN IF NOT EXISTS frontage_ft NUMERIC;

COMMENT ON COLUMN public.franchises.property_type IS 'Required commercial property type for a new outlet';
COMMENT ON COLUMN public.franchises.owner_operator_required IS 'Whether the franchisee must be a full-time owner-operator';
COMMENT ON COLUMN public.franchises.preferred_cities IS 'Cities where the brand wants franchisees / expansion';
COMMENT ON COLUMN public.franchises.opening_timeline IS 'Expected outlet opening timeline';
