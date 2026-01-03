-- Migration: Add Bento View Columns to Businesses Table
-- Purpose: Support the new investor-focused Bento Grid layout with additional data fields
-- Date: 2026-01-03

-- Add reason for sale (important trust signal for buyers)
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS reason_for_sale TEXT;

-- Add YoY growth metrics for financial performance
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS revenue_growth_yoy DECIMAL(5, 2);
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS profit_growth_yoy DECIMAL(5, 2);

-- Add lease details for "What Do I Own?" section
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS lease_lock_in_period TEXT;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS security_deposit NUMERIC(15, 2);
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS lease_remaining_years INTEGER;

-- Add transition support details
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS training_period TEXT;

-- Add opportunity highlights (JSONB arrays)
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS growth_opportunities JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS location_highlights JSONB DEFAULT '[]'::jsonb;

-- Add physical assets detailed list (separate from generic assets_included)
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS physical_assets JSONB DEFAULT '[]'::jsonb;

-- Add data completeness score for verification display
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS data_completeness_score INTEGER DEFAULT 0;

-- Add verification status enum value if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_status') THEN
    CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
  END IF;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add verification_status column (string for flexibility)
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';

-- Add profit column if only monthly_profit exists (for annual calculations)
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS annual_profit NUMERIC(15, 2);

-- Create indexes for new searchable/filterable columns
CREATE INDEX IF NOT EXISTS idx_businesses_reason_for_sale ON public.businesses(reason_for_sale) WHERE reason_for_sale IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_businesses_verification_status ON public.businesses(verification_status);
CREATE INDEX IF NOT EXISTS idx_businesses_data_completeness ON public.businesses(data_completeness_score);

-- Add comments for documentation
COMMENT ON COLUMN public.businesses.reason_for_sale IS 'Why the owner is selling - critical trust signal for buyers';
COMMENT ON COLUMN public.businesses.revenue_growth_yoy IS 'Year-over-year revenue growth percentage';
COMMENT ON COLUMN public.businesses.profit_growth_yoy IS 'Year-over-year profit growth percentage';
COMMENT ON COLUMN public.businesses.lease_lock_in_period IS 'Lock-in period for the lease (e.g., "3 years")';
COMMENT ON COLUMN public.businesses.security_deposit IS 'Security deposit amount for the premises';
COMMENT ON COLUMN public.businesses.lease_remaining_years IS 'Number of years remaining on the lease';
COMMENT ON COLUMN public.businesses.training_period IS 'Training/handover period offered by seller (e.g., "2-4 weeks")';
COMMENT ON COLUMN public.businesses.growth_opportunities IS 'JSON array of growth opportunities for new owner';
COMMENT ON COLUMN public.businesses.location_highlights IS 'JSON array of location advantages (e.g., ["High footfall", "Near metro"])';
COMMENT ON COLUMN public.businesses.physical_assets IS 'JSON array of specific physical assets included in sale';
COMMENT ON COLUMN public.businesses.data_completeness_score IS 'Percentage score indicating listing data completeness (0-100)';
COMMENT ON COLUMN public.businesses.verification_status IS 'Current verification status: pending, verified, or rejected';
COMMENT ON COLUMN public.businesses.annual_profit IS 'Annual profit/SDE for payback calculations';

-- Function to auto-calculate data completeness score
CREATE OR REPLACE FUNCTION calculate_business_completeness()
RETURNS TRIGGER AS $$
DECLARE
  score INTEGER := 0;
  max_score INTEGER := 100;
BEGIN
  -- Core fields (50 points)
  IF NEW.name IS NOT NULL THEN score := score + 5; END IF;
  IF NEW.description IS NOT NULL AND LENGTH(NEW.description) > 100 THEN score := score + 10; END IF;
  IF NEW.price IS NOT NULL THEN score := score + 5; END IF;
  IF NEW.revenue IS NOT NULL THEN score := score + 10; END IF;
  IF NEW.industry IS NOT NULL THEN score := score + 5; END IF;
  IF NEW.city IS NOT NULL AND NEW.state IS NOT NULL THEN score := score + 5; END IF;
  IF NEW.employees IS NOT NULL THEN score := score + 5; END IF;
  IF NEW.established_year IS NOT NULL THEN score := score + 5; END IF;
  
  -- Financial details (20 points)
  IF NEW.annual_profit IS NOT NULL OR NEW.monthly_profit IS NOT NULL THEN score := score + 10; END IF;
  IF NEW.revenue_growth_yoy IS NOT NULL THEN score := score + 5; END IF;
  IF NEW.profit_growth_yoy IS NOT NULL THEN score := score + 5; END IF;
  
  -- Property/Lease (15 points)
  IF NEW.monthly_rent IS NOT NULL THEN score := score + 5; END IF;
  IF NEW.lease_remaining_years IS NOT NULL OR NEW.lease_expiry IS NOT NULL THEN score := score + 5; END IF;
  IF NEW.lease_lock_in_period IS NOT NULL THEN score := score + 5; END IF;
  
  -- Trust signals (10 points)
  IF NEW.reason_for_sale IS NOT NULL THEN score := score + 5; END IF;
  IF NEW.training_period IS NOT NULL THEN score := score + 5; END IF;
  
  -- Media (5 points)
  IF NEW.images IS NOT NULL AND jsonb_array_length(NEW.images) > 0 THEN score := score + 5; END IF;
  
  NEW.data_completeness_score := score;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate completeness
DROP TRIGGER IF EXISTS calculate_business_completeness_trigger ON public.businesses;
CREATE TRIGGER calculate_business_completeness_trigger
BEFORE INSERT OR UPDATE ON public.businesses
FOR EACH ROW
EXECUTE FUNCTION calculate_business_completeness();

-- =====================================================
-- FRANCHISE TABLE COLUMNS FOR BENTO VIEW
-- =====================================================

-- Add mission statement for brand carousel
ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS mission TEXT;

-- Add founder bio for leadership section
ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS founder_bio TEXT;

-- Add available territories count for territory search
ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS available_territories_count INTEGER DEFAULT 0;

-- Add breakeven period text (human readable)
ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS breakeven_period TEXT;

-- Add countries operating count
ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS countries_operating INTEGER DEFAULT 1;

-- Add data completeness score
ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS data_completeness_score INTEGER DEFAULT 0;

-- Add verification status
ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';

-- Add territory availability data (enhanced from expansion_territories)
-- Format: [{city: "Mumbai", status: "available"}, {city: "Delhi", status: "taken"}]
ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS territory_availability JSONB DEFAULT '[]'::jsonb;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_franchises_verification_status ON public.franchises(verification_status);
CREATE INDEX IF NOT EXISTS idx_franchises_data_completeness ON public.franchises(data_completeness_score);
CREATE INDEX IF NOT EXISTS idx_franchises_available_territories ON public.franchises(available_territories_count);

-- Add comments
COMMENT ON COLUMN public.franchises.mission IS 'Mission statement and values for brand carousel';
COMMENT ON COLUMN public.franchises.founder_bio IS 'Founder/leadership biography for brand section';
COMMENT ON COLUMN public.franchises.available_territories_count IS 'Number of territories currently available for franchising';
COMMENT ON COLUMN public.franchises.breakeven_period IS 'Human readable breakeven period (e.g., "18-24 months")';
COMMENT ON COLUMN public.franchises.countries_operating IS 'Number of countries the franchise operates in';
COMMENT ON COLUMN public.franchises.territory_availability IS 'JSON array of territories with availability status';
COMMENT ON COLUMN public.franchises.data_completeness_score IS 'Percentage score indicating listing data completeness (0-100)';
COMMENT ON COLUMN public.franchises.verification_status IS 'Current verification status: pending, verified, or rejected';

-- Function to auto-calculate franchise data completeness score
CREATE OR REPLACE FUNCTION calculate_franchise_completeness()
RETURNS TRIGGER AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  -- Core fields (50 points)
  IF NEW.brand_name IS NOT NULL THEN score := score + 5; END IF;
  IF NEW.description IS NOT NULL AND LENGTH(NEW.description) > 100 THEN score := score + 10; END IF;
  IF NEW.industry IS NOT NULL THEN score := score + 5; END IF;
  IF NEW.franchise_fee IS NOT NULL THEN score := score + 5; END IF;
  IF NEW.total_investment_min IS NOT NULL THEN score := score + 5; END IF;
  IF NEW.total_investment_max IS NOT NULL THEN score := score + 5; END IF;
  IF NEW.established_year IS NOT NULL THEN score := score + 5; END IF;
  IF NEW.total_outlets IS NOT NULL AND NEW.total_outlets > 0 THEN score := score + 5; END IF;
  IF NEW.royalty_percentage IS NOT NULL THEN score := score + 5; END IF;
  
  -- Financial projections (20 points)
  IF NEW.expected_roi_percentage IS NOT NULL THEN score := score + 10; END IF;
  IF NEW.payback_period_months IS NOT NULL OR NEW.breakeven_period IS NOT NULL THEN score := score + 5; END IF;
  IF NEW.average_unit_revenue IS NOT NULL THEN score := score + 5; END IF;
  
  -- Brand story (15 points)
  IF NEW.brand_story IS NOT NULL THEN score := score + 5; END IF;
  IF NEW.mission IS NOT NULL THEN score := score + 5; END IF;
  IF NEW.founder_bio IS NOT NULL THEN score := score + 5; END IF;
  
  -- Support & territories (10 points)
  IF NEW.support_provided IS NOT NULL AND jsonb_array_length(NEW.support_provided) > 0 THEN score := score + 5; END IF;
  IF NEW.territory_availability IS NOT NULL AND jsonb_array_length(NEW.territory_availability) > 0 THEN score := score + 5; END IF;
  
  -- Media (5 points)
  IF NEW.images IS NOT NULL AND jsonb_array_length(NEW.images) > 0 THEN score := score + 5; END IF;
  
  NEW.data_completeness_score := score;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate franchise completeness
DROP TRIGGER IF EXISTS calculate_franchise_completeness_trigger ON public.franchises;
CREATE TRIGGER calculate_franchise_completeness_trigger
BEFORE INSERT OR UPDATE ON public.franchises
FOR EACH ROW
EXECUTE FUNCTION calculate_franchise_completeness();

