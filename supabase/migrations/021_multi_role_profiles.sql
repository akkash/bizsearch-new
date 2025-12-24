-- Migration: Multi-Role Profile Support
-- Creates normalized tables for role-specific data

-- ============================================
-- 1. Create profile_roles junction table
-- ============================================
CREATE TABLE IF NOT EXISTS public.profile_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique role per profile
  UNIQUE(profile_id, role)
);

CREATE INDEX idx_profile_roles_profile_id ON public.profile_roles(profile_id);
CREATE INDEX idx_profile_roles_role ON public.profile_roles(role);

-- ============================================
-- 2. Create seller_details table
-- ============================================
CREATE TABLE IF NOT EXISTS public.seller_details (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT,
  company_logo TEXT,
  founded_year INTEGER,
  employees INTEGER,
  industry TEXT,
  business_type TEXT, -- 'sole-proprietorship', 'partnership', 'llc', 'corporation'
  key_products JSONB,
  asking_price NUMERIC(15, 2),
  monthly_revenue NUMERIC(15, 2),
  annual_revenue NUMERIC(15, 2),
  net_profit NUMERIC(15, 2),
  reason_for_selling TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. Create buyer_details table
-- ============================================
CREATE TABLE IF NOT EXISTS public.buyer_details (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  buyer_type TEXT, -- 'individual', 'private-equity', 'venture-capital', 'strategic'
  firm_name TEXT,
  firm_logo TEXT,
  investment_min NUMERIC(15, 2),
  investment_max NUMERIC(15, 2),
  preferred_industries JSONB,
  preferred_locations JSONB,
  investment_criteria TEXT,
  financing_preference TEXT, -- 'cash', 'sba-loan', 'seller-financing', 'mixed'
  timeline TEXT,
  experience TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. Create franchisor_details table
-- ============================================
CREATE TABLE IF NOT EXISTS public.franchisor_details (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand_name TEXT,
  brand_logo TEXT,
  industry TEXT,
  year_founded INTEGER,
  total_outlets INTEGER,
  franchise_fee NUMERIC(15, 2),
  royalty_percentage NUMERIC(5, 2),
  investment_min NUMERIC(15, 2),
  investment_max NUMERIC(15, 2),
  brand_story TEXT,
  key_differentiators JSONB,
  support_provided JSONB,
  territory_availability JSONB,
  franchisee_requirements JSONB,
  avg_unit_revenue NUMERIC(15, 2),
  avg_unit_profit NUMERIC(15, 2),
  break_even_months INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. Create franchisee_details table
-- ============================================
CREATE TABLE IF NOT EXISTS public.franchisee_details (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  preferred_industries JSONB,
  preferred_territories JSONB,
  investment_budget_min NUMERIC(15, 2),
  investment_budget_max NUMERIC(15, 2),
  business_experience TEXT,
  franchise_experience TEXT,
  industry_experience TEXT,
  timeline TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. Create advisor_details table
-- ============================================
CREATE TABLE IF NOT EXISTS public.advisor_details (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  firm_name TEXT,
  firm_logo TEXT,
  license_number TEXT,
  services JSONB,
  specialization JSONB,
  coverage_regions JSONB,
  years_experience INTEGER,
  credentials JSONB,
  success_rate NUMERIC(5, 2),
  avg_deal_size NUMERIC(15, 2),
  total_deals_completed INTEGER,
  commission_structure TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. Add updated_at triggers
-- ============================================
CREATE TRIGGER update_seller_details_updated_at
BEFORE UPDATE ON public.seller_details
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buyer_details_updated_at
BEFORE UPDATE ON public.buyer_details
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_franchisor_details_updated_at
BEFORE UPDATE ON public.franchisor_details
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_franchisee_details_updated_at
BEFORE UPDATE ON public.franchisee_details
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advisor_details_updated_at
BEFORE UPDATE ON public.advisor_details
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. Enable RLS on new tables
-- ============================================
ALTER TABLE public.profile_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.franchisor_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.franchisee_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_details ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 9. RLS Policies - Users can manage their own data
-- ============================================

-- profile_roles policies
CREATE POLICY "Users can view own roles" ON public.profile_roles
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own roles" ON public.profile_roles
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own roles" ON public.profile_roles
  FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete own roles" ON public.profile_roles
  FOR DELETE USING (auth.uid() = profile_id);

-- seller_details policies
CREATE POLICY "Users can view own seller details" ON public.seller_details
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can manage own seller details" ON public.seller_details
  FOR ALL USING (auth.uid() = profile_id);

-- buyer_details policies
CREATE POLICY "Users can view own buyer details" ON public.buyer_details
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can manage own buyer details" ON public.buyer_details
  FOR ALL USING (auth.uid() = profile_id);

-- franchisor_details policies
CREATE POLICY "Users can view own franchisor details" ON public.franchisor_details
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can manage own franchisor details" ON public.franchisor_details
  FOR ALL USING (auth.uid() = profile_id);

-- franchisee_details policies
CREATE POLICY "Users can view own franchisee details" ON public.franchisee_details
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can manage own franchisee details" ON public.franchisee_details
  FOR ALL USING (auth.uid() = profile_id);

-- advisor_details policies
CREATE POLICY "Users can view own advisor details" ON public.advisor_details
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can manage own advisor details" ON public.advisor_details
  FOR ALL USING (auth.uid() = profile_id);

-- ============================================
-- 10. Migrate existing data from profiles table
-- ============================================

-- Migrate to profile_roles (insert current role for all profiles)
INSERT INTO public.profile_roles (profile_id, role, is_primary)
SELECT id, role, TRUE 
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (profile_id, role) DO NOTHING;

-- Migrate seller data
INSERT INTO public.seller_details (profile_id, founded_year, employees, industry, key_products, asking_price)
SELECT id, founded_year, employees, industry, key_products, asking_price
FROM public.profiles
WHERE role = 'seller' AND (founded_year IS NOT NULL OR employees IS NOT NULL OR asking_price IS NOT NULL)
ON CONFLICT (profile_id) DO NOTHING;

-- Migrate buyer data
INSERT INTO public.buyer_details (profile_id, buyer_type, investment_min, investment_max, preferred_industries, investment_criteria)
SELECT id, buyer_type, investment_min, investment_max, preferred_industries, investment_criteria
FROM public.profiles
WHERE role = 'buyer' AND (buyer_type IS NOT NULL OR investment_min IS NOT NULL OR investment_max IS NOT NULL)
ON CONFLICT (profile_id) DO NOTHING;

-- Migrate franchisor data
INSERT INTO public.franchisor_details (profile_id, total_outlets, royalty_percentage, franchise_fee, support_provided)
SELECT id, total_outlets, royalty_percentage, franchise_fee, support
FROM public.profiles
WHERE role = 'franchisor' AND (total_outlets IS NOT NULL OR royalty_percentage IS NOT NULL OR franchise_fee IS NOT NULL)
ON CONFLICT (profile_id) DO NOTHING;

-- ============================================
-- 11. Add comment for documentation
-- ============================================
COMMENT ON TABLE public.profile_roles IS 'Junction table allowing users to have multiple roles';
COMMENT ON TABLE public.seller_details IS 'Role-specific details for business sellers';
COMMENT ON TABLE public.buyer_details IS 'Role-specific details for business buyers';
COMMENT ON TABLE public.franchisor_details IS 'Role-specific details for franchisors';
COMMENT ON TABLE public.franchisee_details IS 'Role-specific details for franchisees';
COMMENT ON TABLE public.advisor_details IS 'Role-specific details for advisors/brokers';
