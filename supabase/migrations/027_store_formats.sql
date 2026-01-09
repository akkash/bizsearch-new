-- Migration: Add store_formats JSONB column to franchises table
-- This replaces the single space_required_sqft integer with a flexible array
-- that supports multiple franchise formats (Kiosk, Express, Standard, etc.)

-- Add store_formats column
ALTER TABLE public.franchises 
ADD COLUMN IF NOT EXISTS store_formats jsonb DEFAULT '[]'::jsonb;

-- Comment explaining the structure
COMMENT ON COLUMN public.franchises.store_formats IS 
'Array of store format objects: [{id, name, minSqft, maxSqft, investmentMin, investmentMax, description}]';

-- Migrate existing space_required_sqft data to store_formats (if any exists)
UPDATE public.franchises 
SET store_formats = jsonb_build_array(
  jsonb_build_object(
    'id', 'standard',
    'name', 'Standard',
    'minSqft', COALESCE(space_required_sqft, 0),
    'maxSqft', COALESCE(space_required_sqft, 0),
    'description', 'Standard outlet format'
  )
)
WHERE space_required_sqft IS NOT NULL 
  AND (store_formats IS NULL OR store_formats = '[]'::jsonb);

-- Create index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_franchises_store_formats 
ON public.franchises USING gin (store_formats);

-- Also add minimum_net_worth column if it doesn't exist
ALTER TABLE public.franchises 
ADD COLUMN IF NOT EXISTS minimum_net_worth numeric;

COMMENT ON COLUMN public.franchises.minimum_net_worth IS 
'Minimum net worth required from franchisee applicants';
