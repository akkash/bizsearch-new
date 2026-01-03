-- Migration: Add verification and data quality fields to listings
-- Phase 1.1: Verification System

-- Add verification fields to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('verified', 'pending', 'unverified', 'rejected')),
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS verification_notes TEXT,
ADD COLUMN IF NOT EXISTS data_completeness_score INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- Add verification fields to franchises table
ALTER TABLE franchises 
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('verified', 'pending', 'unverified', 'rejected')),
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS verification_notes TEXT,
ADD COLUMN IF NOT EXISTS data_completeness_score INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- Create verification_logs table for audit trail
CREATE TABLE IF NOT EXISTS verification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL,
    listing_type TEXT NOT NULL CHECK (listing_type IN ('business', 'franchise')),
    previous_status TEXT,
    new_status TEXT NOT NULL,
    verified_by UUID REFERENCES profiles(id),
    notes TEXT,
    verification_method TEXT, -- 'manual', 'automated', 'document', 'phone'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_logs_listing ON verification_logs(listing_id, listing_type);
CREATE INDEX IF NOT EXISTS idx_businesses_verification_status ON businesses(verification_status);
CREATE INDEX IF NOT EXISTS idx_franchises_verification_status ON franchises(verification_status);
CREATE INDEX IF NOT EXISTS idx_businesses_last_activity ON businesses(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_franchises_last_activity ON franchises(last_activity_at);

-- Function to calculate data completeness score for businesses
CREATE OR REPLACE FUNCTION calculate_business_completeness(business_row businesses)
RETURNS INT AS $$
DECLARE
    score INT := 0;
    max_score INT := 100;
BEGIN
    -- Required fields (60 points)
    IF business_row.name IS NOT NULL AND business_row.name != '' THEN score := score + 10; END IF;
    IF business_row.description IS NOT NULL AND length(business_row.description) > 50 THEN score := score + 10; END IF;
    IF business_row.industry IS NOT NULL THEN score := score + 10; END IF;
    IF business_row.location IS NOT NULL THEN score := score + 10; END IF;
    IF business_row.price IS NOT NULL AND business_row.price > 0 THEN score := score + 10; END IF;
    IF business_row.revenue IS NOT NULL THEN score := score + 10; END IF;
    
    -- Optional but valuable fields (40 points)
    IF business_row.established_year IS NOT NULL THEN score := score + 5; END IF;
    IF business_row.employees IS NOT NULL THEN score := score + 5; END IF;
    IF business_row.images IS NOT NULL AND jsonb_array_length(business_row.images) > 0 THEN score := score + 10; END IF;
    IF business_row.reason_for_selling IS NOT NULL THEN score := score + 5; END IF;
    IF business_row.assets_included IS NOT NULL THEN score := score + 5; END IF;
    IF business_row.financials IS NOT NULL THEN score := score + 10; END IF;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate data completeness score for franchises
CREATE OR REPLACE FUNCTION calculate_franchise_completeness(franchise_row franchises)
RETURNS INT AS $$
DECLARE
    score INT := 0;
BEGIN
    -- Required fields (60 points)
    IF franchise_row.brand_name IS NOT NULL AND franchise_row.brand_name != '' THEN score := score + 10; END IF;
    IF franchise_row.description IS NOT NULL AND length(franchise_row.description) > 50 THEN score := score + 10; END IF;
    IF franchise_row.industry IS NOT NULL THEN score := score + 10; END IF;
    IF franchise_row.investment_range_min IS NOT NULL THEN score := score + 10; END IF;
    IF franchise_row.investment_range_max IS NOT NULL THEN score := score + 10; END IF;
    IF franchise_row.franchise_fee IS NOT NULL THEN score := score + 10; END IF;
    
    -- Optional but valuable fields (40 points)
    IF franchise_row.established_year IS NOT NULL THEN score := score + 5; END IF;
    IF franchise_row.total_outlets IS NOT NULL THEN score := score + 5; END IF;
    IF franchise_row.logo_url IS NOT NULL THEN score := score + 5; END IF;
    IF franchise_row.training_provided IS NOT NULL THEN score := score + 5; END IF;
    IF franchise_row.support_provided IS NOT NULL THEN score := score + 5; END IF;
    IF franchise_row.territory_rights IS NOT NULL THEN score := score + 5; END IF;
    IF franchise_row.space_required IS NOT NULL THEN score := score + 5; END IF;
    IF franchise_row.roi_timeline IS NOT NULL THEN score := score + 5; END IF;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update completeness score on business insert/update
CREATE OR REPLACE FUNCTION update_business_completeness()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_completeness_score := calculate_business_completeness(NEW);
    NEW.last_activity_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_business_completeness
BEFORE INSERT OR UPDATE ON businesses
FOR EACH ROW
EXECUTE FUNCTION update_business_completeness();

-- Trigger to auto-update completeness score on franchise insert/update
CREATE OR REPLACE FUNCTION update_franchise_completeness()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_completeness_score := calculate_franchise_completeness(NEW);
    NEW.last_activity_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_franchise_completeness
BEFORE INSERT OR UPDATE ON franchises
FOR EACH ROW
EXECUTE FUNCTION update_franchise_completeness();

-- RLS policies for verification_logs
ALTER TABLE verification_logs ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage verification logs"
ON verification_logs FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- Anyone can view verification logs (for transparency)
CREATE POLICY "Anyone can view verification logs"
ON verification_logs FOR SELECT
TO authenticated
USING (true);

-- Update existing records to calculate completeness scores
-- (Run this after deploying the migration)
-- UPDATE businesses SET data_completeness_score = calculate_business_completeness(businesses.*);
-- UPDATE franchises SET data_completeness_score = calculate_franchise_completeness(franchises.*);
