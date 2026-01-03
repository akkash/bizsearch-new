-- Fix: Update completeness calculation functions to use only existing columns

-- Drop and recreate the business completeness function
CREATE OR REPLACE FUNCTION calculate_business_completeness(business_row businesses)
RETURNS INT AS $$
DECLARE
    score INT := 0;
BEGIN
    -- Required fields (60 points)
    IF business_row.name IS NOT NULL AND business_row.name != '' THEN score := score + 10; END IF;
    IF business_row.description IS NOT NULL AND length(business_row.description) > 50 THEN score := score + 10; END IF;
    IF business_row.industry IS NOT NULL THEN score := score + 10; END IF;
    IF business_row.location IS NOT NULL THEN score := score + 10; END IF;
    IF business_row.price IS NOT NULL AND business_row.price > 0 THEN score := score + 10; END IF;
    IF business_row.revenue IS NOT NULL THEN score := score + 10; END IF;
    
    -- Optional but valuable fields (40 points)
    IF business_row.established_year IS NOT NULL THEN score := score + 10; END IF;
    IF business_row.employees IS NOT NULL THEN score := score + 10; END IF;
    IF business_row.images IS NOT NULL AND jsonb_array_length(business_row.images) > 0 THEN score := score + 10; END IF;
    IF business_row.city IS NOT NULL THEN score := score + 5; END IF;
    IF business_row.state IS NOT NULL THEN score := score + 5; END IF;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the franchise completeness function
CREATE OR REPLACE FUNCTION calculate_franchise_completeness(franchise_row franchises)
RETURNS INT AS $$
DECLARE
    score INT := 0;
BEGIN
    -- Required fields (60 points)
    IF franchise_row.brand_name IS NOT NULL AND franchise_row.brand_name != '' THEN score := score + 10; END IF;
    IF franchise_row.description IS NOT NULL AND length(franchise_row.description) > 50 THEN score := score + 10; END IF;
    IF franchise_row.industry IS NOT NULL THEN score := score + 10; END IF;
    IF franchise_row.total_investment_min IS NOT NULL THEN score := score + 10; END IF;
    IF franchise_row.total_investment_max IS NOT NULL THEN score := score + 10; END IF;
    IF franchise_row.franchise_fee IS NOT NULL THEN score := score + 10; END IF;
    
    -- Optional but valuable fields (40 points)
    IF franchise_row.established_year IS NOT NULL THEN score := score + 10; END IF;
    IF franchise_row.total_outlets IS NOT NULL THEN score := score + 10; END IF;
    IF franchise_row.logo_url IS NOT NULL THEN score := score + 10; END IF;
    IF franchise_row.royalty_percentage IS NOT NULL THEN score := score + 5; END IF;
    IF franchise_row.expected_roi_percentage IS NOT NULL THEN score := score + 5; END IF;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Now trigger the update for all existing records
UPDATE businesses SET name = name WHERE true;
UPDATE franchises SET brand_name = brand_name WHERE true;
