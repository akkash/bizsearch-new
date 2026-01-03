-- Migration: Stale Listing Flagging and Data Quality Functions
-- Purpose: Complete Phase 1 Foundation with automated stale detection and data quality reporting
-- Date: 2026-01-03

-- Add is_stale column to businesses
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS is_stale BOOLEAN DEFAULT FALSE;

-- Add is_stale column to franchises
ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS is_stale BOOLEAN DEFAULT FALSE;

-- Add last_activity_at to track actual activity (separate from updated_at which may update on any change)
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.franchises ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes for stale listing queries
CREATE INDEX IF NOT EXISTS idx_businesses_stale ON public.businesses(is_stale) WHERE is_stale = TRUE;
CREATE INDEX IF NOT EXISTS idx_franchises_stale ON public.franchises(is_stale) WHERE is_stale = TRUE;
CREATE INDEX IF NOT EXISTS idx_businesses_last_activity ON public.businesses(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_franchises_last_activity ON public.franchises(last_activity_at);

-- Function to flag stale listings (no updates > 90 days)
CREATE OR REPLACE FUNCTION flag_stale_listings()
RETURNS TABLE(
  stale_businesses_count INT,
  stale_franchises_count INT
) AS $$
DECLARE
  biz_count INT;
  fran_count INT;
  stale_threshold INTERVAL := INTERVAL '90 days';
BEGIN
  -- Flag stale businesses
  UPDATE public.businesses
  SET is_stale = TRUE
  WHERE updated_at < NOW() - stale_threshold
    AND is_stale = FALSE
    AND status = 'active';
  
  GET DIAGNOSTICS biz_count = ROW_COUNT;
  
  -- Flag stale franchises
  UPDATE public.franchises
  SET is_stale = TRUE
  WHERE updated_at < NOW() - stale_threshold
    AND is_stale = FALSE
    AND status = 'active';
  
  GET DIAGNOSTICS fran_count = ROW_COUNT;
  
  -- Unflag listings that have been updated recently
  UPDATE public.businesses
  SET is_stale = FALSE
  WHERE updated_at >= NOW() - stale_threshold
    AND is_stale = TRUE;
  
  UPDATE public.franchises
  SET is_stale = FALSE
  WHERE updated_at >= NOW() - stale_threshold
    AND is_stale = TRUE;
  
  RETURN QUERY SELECT biz_count, fran_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get data quality report for admin dashboard
CREATE OR REPLACE FUNCTION get_data_quality_report()
RETURNS TABLE(
  total_businesses INT,
  total_franchises INT,
  verified_businesses INT,
  verified_franchises INT,
  pending_businesses INT,
  pending_franchises INT,
  stale_businesses INT,
  stale_franchises INT,
  low_completeness_businesses INT,
  low_completeness_franchises INT,
  avg_business_completeness NUMERIC,
  avg_franchise_completeness NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INT FROM public.businesses WHERE status = 'active') AS total_businesses,
    (SELECT COUNT(*)::INT FROM public.franchises WHERE status = 'active') AS total_franchises,
    (SELECT COUNT(*)::INT FROM public.businesses WHERE verification_status = 'verified' AND status = 'active') AS verified_businesses,
    (SELECT COUNT(*)::INT FROM public.franchises WHERE verification_status = 'verified' AND status = 'active') AS verified_franchises,
    (SELECT COUNT(*)::INT FROM public.businesses WHERE verification_status = 'pending' AND status = 'active') AS pending_businesses,
    (SELECT COUNT(*)::INT FROM public.franchises WHERE verification_status = 'pending' AND status = 'active') AS pending_franchises,
    (SELECT COUNT(*)::INT FROM public.businesses WHERE is_stale = TRUE AND status = 'active') AS stale_businesses,
    (SELECT COUNT(*)::INT FROM public.franchises WHERE is_stale = TRUE AND status = 'active') AS stale_franchises,
    (SELECT COUNT(*)::INT FROM public.businesses WHERE data_completeness_score < 50 AND status = 'active') AS low_completeness_businesses,
    (SELECT COUNT(*)::INT FROM public.franchises WHERE data_completeness_score < 50 AND status = 'active') AS low_completeness_franchises,
    (SELECT COALESCE(AVG(data_completeness_score), 0)::NUMERIC FROM public.businesses WHERE status = 'active') AS avg_business_completeness,
    (SELECT COALESCE(AVG(data_completeness_score), 0)::NUMERIC FROM public.franchises WHERE status = 'active') AS avg_franchise_completeness;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get listings with missing critical fields
CREATE OR REPLACE FUNCTION get_incomplete_listings(threshold INT DEFAULT 50)
RETURNS TABLE(
  id UUID,
  name TEXT,
  listing_type TEXT,
  completeness_score INT,
  industry TEXT,
  location TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    'business'::TEXT,
    b.data_completeness_score,
    b.industry,
    b.city || ', ' || b.state AS location,
    b.created_at
  FROM public.businesses b
  WHERE b.data_completeness_score < threshold
    AND b.status = 'active'
  UNION ALL
  SELECT 
    f.id,
    f.brand_name,
    'franchise'::TEXT,
    f.data_completeness_score,
    f.industry,
    COALESCE(f.headquarters_city, '') || ', ' || COALESCE(f.headquarters_state, '') AS location,
    f.created_at
  FROM public.franchises f
  WHERE f.data_completeness_score < threshold
    AND f.status = 'active'
  ORDER BY completeness_score ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify a listing
CREATE OR REPLACE FUNCTION verify_listing(
  p_listing_id UUID,
  p_listing_type TEXT,
  p_verifier_id UUID,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  IF p_listing_type = 'business' THEN
    UPDATE public.businesses
    SET 
      verification_status = 'verified',
      verified_at = NOW(),
      updated_at = NOW()
    WHERE id = p_listing_id;
  ELSIF p_listing_type = 'franchise' THEN
    UPDATE public.franchises
    SET 
      verification_status = 'verified',
      verified_at = NOW(),
      updated_at = NOW()
    WHERE id = p_listing_id;
  ELSE
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject a listing
CREATE OR REPLACE FUNCTION reject_listing(
  p_listing_id UUID,
  p_listing_type TEXT,
  p_verifier_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  IF p_listing_type = 'business' THEN
    UPDATE public.businesses
    SET 
      verification_status = 'rejected',
      updated_at = NOW()
    WHERE id = p_listing_id;
  ELSIF p_listing_type = 'franchise' THEN
    UPDATE public.franchises
    SET 
      verification_status = 'rejected',
      updated_at = NOW()
    WHERE id = p_listing_id;
  ELSE
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users (admin check should be in RLS or app layer)
GRANT EXECUTE ON FUNCTION flag_stale_listings() TO authenticated;
GRANT EXECUTE ON FUNCTION get_data_quality_report() TO authenticated;
GRANT EXECUTE ON FUNCTION get_incomplete_listings(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_listing(UUID, TEXT, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_listing(UUID, TEXT, UUID, TEXT) TO authenticated;

-- Add comments
COMMENT ON FUNCTION flag_stale_listings() IS 'Flags listings with no updates in 90+ days as stale';
COMMENT ON FUNCTION get_data_quality_report() IS 'Returns aggregate data quality metrics for admin dashboard';
COMMENT ON FUNCTION get_incomplete_listings(INT) IS 'Returns listings with completeness score below threshold';
COMMENT ON FUNCTION verify_listing(UUID, TEXT, UUID, TEXT) IS 'Marks a listing as verified by admin';
COMMENT ON FUNCTION reject_listing(UUID, TEXT, UUID, TEXT) IS 'Marks a listing as rejected by admin';
