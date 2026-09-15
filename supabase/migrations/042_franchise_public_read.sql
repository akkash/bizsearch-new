-- Public catalog: active+public only, no contact/owner/review internals.
-- Owners and admins keep full-row access on the base tables.

DROP POLICY IF EXISTS "Active franchises are publicly viewable" ON public.franchises;
DROP POLICY IF EXISTS "Franchisors can view own franchises" ON public.franchises;

CREATE POLICY "Franchisors can view own franchises"
ON public.franchises FOR SELECT
USING (auth.uid() = franchisor_id);

REVOKE SELECT ON public.franchises FROM anon;

CREATE OR REPLACE VIEW public.franchise_public AS
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
  breakeven_period
FROM public.franchises
WHERE status = 'active'
  AND COALESCE(visibility, 'public') = 'public';

ALTER VIEW public.franchise_public SET (security_invoker = false);
GRANT SELECT ON public.franchise_public TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can view active businesses" ON public.businesses;
DROP POLICY IF EXISTS "Businesses are viewable by public and owners" ON public.businesses;
DROP POLICY IF EXISTS "Sellers can view own businesses" ON public.businesses;

CREATE POLICY "Sellers can view own businesses"
ON public.businesses FOR SELECT
USING (auth.uid() = seller_id);

REVOKE SELECT ON public.businesses FROM anon;

-- Keep existing admin SELECT on businesses; recreate public catalog via view.
CREATE OR REPLACE VIEW public.business_public AS
SELECT
  id,
  slug,
  name,
  tagline,
  industry,
  business_type,
  description,
  business_model,
  country,
  state,
  city,
  location,
  established_year,
  years_in_operation,
  employees,
  price,
  price_range,
  revenue,
  revenue_range,
  monthly_profit,
  ebitda,
  profit_margin,
  assets_included,
  logo_url,
  images,
  videos,
  highlights,
  badges,
  status,
  visibility,
  verification_status,
  verification_tier,
  verified,
  featured,
  trending,
  views_count,
  inquiries_count,
  saves_count,
  created_at,
  published_at,
  meta_title,
  meta_description
FROM public.businesses
WHERE status = 'active'
  AND COALESCE(visibility, 'public') = 'public';

ALTER VIEW public.business_public SET (security_invoker = false);
GRANT SELECT ON public.business_public TO anon, authenticated;

-- Advisor directory join (skip if orphan rows block the FK)
DO $$
BEGIN
  ALTER TABLE public.advisor_profiles DROP CONSTRAINT IF EXISTS advisor_profiles_profile_fk;
  ALTER TABLE public.advisor_profiles
    ADD CONSTRAINT advisor_profiles_profile_fk
    FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'advisor_profiles_profile_fk skipped: %', SQLERRM;
END $$;

-- Operational flags are not public
DROP POLICY IF EXISTS "Feature flags are viewable by everyone" ON public.feature_flags;
DROP POLICY IF EXISTS "Feature flags are viewable by public" ON public.feature_flags;
CREATE POLICY "Feature flags are viewable by public"
ON public.feature_flags FOR SELECT
TO anon, authenticated
USING (category IS DISTINCT FROM 'security' AND category IS DISTINCT FROM 'system');

DROP POLICY IF EXISTS "Admins can view all feature flags" ON public.feature_flags;
CREATE POLICY "Admins can view all feature flags"
ON public.feature_flags FOR SELECT
TO authenticated
USING (public.is_admin());

UPDATE public.feature_flags
SET enabled = false, updated_at = NOW()
WHERE key = 'franchise_map';

-- Financing waitlist
CREATE TABLE IF NOT EXISTS public.financing_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.financing_waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can join financing waitlist" ON public.financing_waitlist;
CREATE POLICY "Anyone can join financing waitlist"
ON public.financing_waitlist FOR INSERT
TO anon, authenticated
WITH CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$');

DROP POLICY IF EXISTS "Admins can read financing waitlist" ON public.financing_waitlist;
CREATE POLICY "Admins can read financing waitlist"
ON public.financing_waitlist FOR SELECT
TO authenticated
USING (public.is_admin());

NOTIFY pgrst, 'reload schema';
