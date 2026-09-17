-- Marketplace data infrastructure: opportunity provenance + lead SLA timestamps.

ALTER TABLE public.franchises
  ADD COLUMN IF NOT EXISTS working_capital NUMERIC,
  ADD COLUMN IF NOT EXISTS field_provenance JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS verification_next_review_at TIMESTAMPTZ;

ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS first_viewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS first_responded_at TIMESTAMPTZ;

UPDATE public.inquiries
SET notified_at = created_at
WHERE notified_at IS NULL;

ALTER TABLE public.inquiries
  ALTER COLUMN notified_at SET DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_inquiries_first_viewed_at ON public.inquiries(first_viewed_at);
CREATE INDEX IF NOT EXISTS idx_inquiries_first_responded_at ON public.inquiries(first_responded_at);

CREATE OR REPLACE FUNCTION public.stamp_inquiry_sla()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.notified_at IS NULL THEN
      NEW.notified_at := NOW();
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
     AND OLD.status = 'new'
     AND NEW.status IS DISTINCT FROM 'new'
     AND NEW.first_responded_at IS NULL THEN
    NEW.first_responded_at := NOW();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS inquiries_stamp_sla ON public.inquiries;
CREATE TRIGGER inquiries_stamp_sla
BEFORE INSERT OR UPDATE ON public.inquiries
FOR EACH ROW
EXECUTE FUNCTION public.stamp_inquiry_sla();

CREATE OR REPLACE FUNCTION public.mark_inquiry_viewed(p_inquiry_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.inquiries
  SET first_viewed_at = COALESCE(first_viewed_at, NOW()),
      updated_at = NOW()
  WHERE id = p_inquiry_id
    AND (
      recipient_id = auth.uid()
      OR public.is_admin()
    );
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_inquiry_viewed(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION calculate_franchise_completeness(franchise_row franchises)
RETURNS INT AS $$
DECLARE
    score INT := 0;
    territory_n INT := 0;
    format_n INT := 0;
    doc_n INT := 0;
BEGIN
    SELECT COUNT(*) INTO territory_n
    FROM public.franchise_territories t
    WHERE t.franchise_id = franchise_row.id;

    IF franchise_row.territory_availability IS NOT NULL
       AND jsonb_typeof(franchise_row.territory_availability) = 'array' THEN
      territory_n := GREATEST(territory_n, jsonb_array_length(franchise_row.territory_availability));
    END IF;

    IF franchise_row.store_formats IS NOT NULL
       AND jsonb_typeof(franchise_row.store_formats) = 'array' THEN
      format_n := jsonb_array_length(franchise_row.store_formats);
    END IF;

    IF franchise_row.documents IS NOT NULL
       AND jsonb_typeof(franchise_row.documents) = 'array' THEN
      doc_n := jsonb_array_length(franchise_row.documents);
    END IF;

    IF franchise_row.brand_name IS NOT NULL AND franchise_row.brand_name != '' THEN score := score + 8; END IF;
    IF franchise_row.industry IS NOT NULL THEN score := score + 6; END IF;
    IF franchise_row.description IS NOT NULL AND length(franchise_row.description) >= 40 THEN score := score + 6; END IF;
    IF franchise_row.franchise_fee IS NOT NULL THEN score := score + 8; END IF;
    IF franchise_row.total_investment_min IS NOT NULL AND franchise_row.total_investment_max IS NOT NULL THEN score := score + 10; END IF;
    IF COALESCE(franchise_row.working_capital, franchise_row.minimum_liquid_capital) IS NOT NULL THEN score := score + 8; END IF;
    IF franchise_row.royalty_percentage IS NOT NULL THEN score := score + 6; END IF;
    IF franchise_row.average_unit_revenue IS NOT NULL THEN score := score + 10; END IF;
    IF franchise_row.average_unit_profit IS NOT NULL THEN score := score + 4; END IF;
    IF franchise_row.breakeven_period IS NOT NULL OR franchise_row.payback_period_months IS NOT NULL THEN score := score + 4; END IF;
    IF territory_n > 0 THEN score := score + 14; END IF;
    IF format_n > 0 OR franchise_row.min_area_sqft IS NOT NULL THEN score := score + 8; END IF;
    IF franchise_row.training_provided IS NOT NULL OR franchise_row.training_duration_days IS NOT NULL THEN score := score + 4; END IF;
    IF doc_n > 0 THEN score := score + 4; END IF;

    RETURN LEAST(100, score);
END;
$$ LANGUAGE plpgsql;

DROP VIEW IF EXISTS public.franchise_public;
CREATE VIEW public.franchise_public AS
SELECT
  id,
  slug,
  brand_name,
  tagline,
  industry,
  description,
  brand_story,
  logo_url,
  images,
  videos,
  documents,
  website,
  franchise_fee,
  total_investment_min,
  total_investment_max,
  royalty_percentage,
  marketing_fee_percentage,
  total_outlets,
  company_owned_outlets,
  franchise_outlets,
  space_required_sqft,
  average_unit_revenue,
  average_unit_profit,
  payback_period_months,
  expected_roi_percentage,
  training_provided,
  training_duration_days,
  support_provided,
  marketing_support,
  minimum_net_worth,
  minimum_liquid_capital,
  experience_required,
  headquarters_country,
  headquarters_state,
  headquarters_city,
  operating_locations,
  expansion_territories,
  territory_availability,
  highlights,
  awards,
  featured,
  trending,
  urgent,
  verified,
  status,
  visibility,
  verification_status,
  verification_tier,
  verified_at,
  views_count,
  inquiries_count,
  applications_count,
  saves_count,
  created_at,
  published_at,
  store_formats,
  property_type,
  min_area_sqft,
  max_area_sqft,
  owner_operator_required,
  opening_timeline,
  preferred_cities,
  preferred_experience,
  ground_floor,
  parking_required,
  max_rent,
  frontage_ft,
  available_territories_count,
  data_completeness_score,
  is_stale,
  last_activity_at,
  established_year,
  mission,
  founder_bio,
  countries_operating,
  breakeven_period,
  working_capital,
  field_provenance,
  verification_next_review_at
FROM public.franchises
WHERE status = 'active'
  AND COALESCE(visibility, 'public') = 'public';

ALTER VIEW public.franchise_public SET (security_invoker = false);
GRANT SELECT ON public.franchise_public TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
