-- Business Listings Tables
-- This migration creates tables for business and franchise listings

-- Create listing status enum
CREATE TYPE listing_status AS ENUM ('draft', 'pending_review', 'active', 'sold', 'inactive', 'rejected');
CREATE TYPE business_type_enum AS ENUM ('asset_sale', 'stock_sale', 'franchise');
CREATE TYPE verification_tier AS ENUM ('basic', 'verified', 'premium');

-- Create businesses table
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Basic Information
  name TEXT NOT NULL,
  tagline TEXT,
  slug TEXT UNIQUE,
  industry TEXT NOT NULL,
  business_type business_type_enum DEFAULT 'asset_sale',
  
  -- Location
  country TEXT DEFAULT 'India',
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  location TEXT NOT NULL,
  full_address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Business Details
  established_year INTEGER,
  years_in_operation INTEGER,
  employees INTEGER DEFAULT 0,
  description TEXT NOT NULL,
  business_model TEXT,
  
  -- Pricing & Financials
  price NUMERIC(15, 2) NOT NULL,
  price_range TEXT,
  revenue NUMERIC(15, 2),
  revenue_range TEXT,
  monthly_profit NUMERIC(15, 2),
  ebitda NUMERIC(15, 2),
  profit_margin DECIMAL(5, 2),
  
  -- Assets & Operations
  assets_included JSONB DEFAULT '[]'::jsonb,
  equipment_details TEXT,
  inventory_value NUMERIC(15, 2),
  lease_type TEXT,
  monthly_rent NUMERIC(15, 2),
  lease_expiry DATE,
  
  -- Customer & Operations
  customer_profile TEXT,
  operating_hours TEXT,
  days_open_per_week INTEGER DEFAULT 7,
  seasonality TEXT,
  
  -- Media
  logo_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  videos JSONB DEFAULT '[]'::jsonb,
  documents JSONB DEFAULT '[]'::jsonb,
  
  -- Contact
  contact_email TEXT,
  contact_phone TEXT,
  broker_name TEXT,
  preferred_contact_method TEXT DEFAULT 'platform',
  
  -- Highlights & Features
  highlights JSONB DEFAULT '[]'::jsonb,
  badges JSONB DEFAULT '[]'::jsonb,
  
  -- Verification & Status
  status listing_status DEFAULT 'draft',
  verification_tier verification_tier DEFAULT 'basic',
  verified BOOLEAN DEFAULT FALSE,
  documents_verified BOOLEAN DEFAULT FALSE,
  identity_verified BOOLEAN DEFAULT FALSE,
  
  -- Visibility & Marketing
  featured BOOLEAN DEFAULT FALSE,
  trending BOOLEAN DEFAULT FALSE,
  visibility TEXT DEFAULT 'public',
  
  -- Metrics
  views_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  
  -- SEO & Metadata
  meta_title TEXT,
  meta_description TEXT,
  keywords JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  sold_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_price CHECK (price > 0),
  CONSTRAINT valid_employees CHECK (employees >= 0),
  CONSTRAINT valid_year CHECK (established_year >= 1800 AND established_year <= EXTRACT(YEAR FROM CURRENT_DATE))
);

-- Create franchises table
CREATE TABLE public.franchises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  franchisor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Basic Information
  brand_name TEXT NOT NULL,
  tagline TEXT,
  slug TEXT UNIQUE,
  industry TEXT NOT NULL,
  
  -- Location
  headquarters_country TEXT DEFAULT 'India',
  headquarters_state TEXT,
  headquarters_city TEXT,
  operating_locations JSONB DEFAULT '[]'::jsonb,
  expansion_territories JSONB DEFAULT '[]'::jsonb,
  
  -- Brand Details
  established_year INTEGER,
  description TEXT NOT NULL,
  brand_story TEXT,
  
  -- Franchise Investment
  franchise_fee NUMERIC(15, 2) NOT NULL,
  total_investment_min NUMERIC(15, 2),
  total_investment_max NUMERIC(15, 2),
  royalty_percentage DECIMAL(5, 2),
  marketing_fee_percentage DECIMAL(5, 2),
  
  -- Operations
  total_outlets INTEGER DEFAULT 0,
  company_owned_outlets INTEGER DEFAULT 0,
  franchise_outlets INTEGER DEFAULT 0,
  space_required_sqft INTEGER,
  
  -- Financial Performance
  average_unit_revenue NUMERIC(15, 2),
  average_unit_profit NUMERIC(15, 2),
  payback_period_months INTEGER,
  expected_roi_percentage DECIMAL(5, 2),
  
  -- Support & Training
  training_provided BOOLEAN DEFAULT TRUE,
  training_duration_days INTEGER,
  support_provided JSONB DEFAULT '[]'::jsonb,
  marketing_support BOOLEAN DEFAULT TRUE,
  
  -- Requirements
  minimum_net_worth NUMERIC(15, 2),
  minimum_liquid_capital NUMERIC(15, 2),
  experience_required TEXT,
  
  -- Media
  logo_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  videos JSONB DEFAULT '[]'::jsonb,
  documents JSONB DEFAULT '[]'::jsonb,
  
  -- Contact
  contact_email TEXT,
  contact_phone TEXT,
  contact_person TEXT,
  website TEXT,
  
  -- Highlights & Features
  highlights JSONB DEFAULT '[]'::jsonb,
  awards JSONB DEFAULT '[]'::jsonb,
  
  -- Verification & Status
  status listing_status DEFAULT 'draft',
  verification_tier verification_tier DEFAULT 'basic',
  verified BOOLEAN DEFAULT FALSE,
  documents_verified BOOLEAN DEFAULT FALSE,
  franchise_registration_verified BOOLEAN DEFAULT FALSE,
  
  -- Visibility & Marketing
  featured BOOLEAN DEFAULT FALSE,
  trending BOOLEAN DEFAULT FALSE,
  urgent BOOLEAN DEFAULT FALSE,
  visibility TEXT DEFAULT 'public',
  
  -- Metrics
  views_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT valid_franchise_fee CHECK (franchise_fee > 0),
  CONSTRAINT valid_outlets CHECK (total_outlets >= 0),
  CONSTRAINT valid_year CHECK (established_year >= 1800 AND established_year <= EXTRACT(YEAR FROM CURRENT_DATE))
);

-- Create saved listings table (bookmarks)
CREATE TABLE public.saved_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('business', 'franchise')),
  listing_id UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, listing_type, listing_id)
);

-- Create inquiries table
CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_type TEXT NOT NULL CHECK (listing_type IN ('business', 'franchise')),
  listing_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  subject TEXT,
  message TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed')),
  nda_signed BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ
);

-- Create indexes for businesses
CREATE INDEX idx_businesses_seller ON public.businesses(seller_id);
CREATE INDEX idx_businesses_status ON public.businesses(status);
CREATE INDEX idx_businesses_industry ON public.businesses(industry);
CREATE INDEX idx_businesses_location ON public.businesses(city, state);
CREATE INDEX idx_businesses_price ON public.businesses(price);
CREATE INDEX idx_businesses_featured ON public.businesses(featured) WHERE featured = TRUE;
CREATE INDEX idx_businesses_trending ON public.businesses(trending) WHERE trending = TRUE;
CREATE INDEX idx_businesses_created ON public.businesses(created_at DESC);
CREATE INDEX idx_businesses_slug ON public.businesses(slug);

-- Full text search index for businesses
CREATE INDEX idx_businesses_search ON public.businesses USING gin(to_tsvector('english', name || ' ' || description));

-- Create indexes for franchises
CREATE INDEX idx_franchises_franchisor ON public.franchises(franchisor_id);
CREATE INDEX idx_franchises_status ON public.franchises(status);
CREATE INDEX idx_franchises_industry ON public.franchises(industry);
CREATE INDEX idx_franchises_investment ON public.franchises(total_investment_min, total_investment_max);
CREATE INDEX idx_franchises_featured ON public.franchises(featured) WHERE featured = TRUE;
CREATE INDEX idx_franchises_created ON public.franchises(created_at DESC);
CREATE INDEX idx_franchises_slug ON public.franchises(slug);

-- Full text search index for franchises
CREATE INDEX idx_franchises_search ON public.franchises USING gin(to_tsvector('english', brand_name || ' ' || description));

-- Create indexes for saved listings
CREATE INDEX idx_saved_listings_user ON public.saved_listings(user_id);
CREATE INDEX idx_saved_listings_type ON public.saved_listings(listing_type, listing_id);

-- Create indexes for inquiries
CREATE INDEX idx_inquiries_sender ON public.inquiries(sender_id);
CREATE INDEX idx_inquiries_recipient ON public.inquiries(recipient_id);
CREATE INDEX idx_inquiries_listing ON public.inquiries(listing_type, listing_id);
CREATE INDEX idx_inquiries_status ON public.inquiries(status);

-- Create updated_at triggers
CREATE TRIGGER update_businesses_updated_at
BEFORE UPDATE ON public.businesses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_franchises_updated_at
BEFORE UPDATE ON public.franchises
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for businesses
-- Anyone can view active businesses, sellers can view their own, admins can view all
CREATE POLICY "Businesses are viewable by public and owners"
ON public.businesses FOR SELECT
USING (
  status = 'active' OR 
  auth.uid() = seller_id OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Sellers can insert their own businesses
CREATE POLICY "Sellers can create businesses"
ON public.businesses FOR INSERT
WITH CHECK (
  auth.uid() = seller_id AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('seller', 'broker', 'admin')
  )
);

-- Sellers can update their own businesses
CREATE POLICY "Sellers can update own businesses"
ON public.businesses FOR UPDATE
USING (auth.uid() = seller_id);

-- Sellers can delete their own businesses
CREATE POLICY "Sellers can delete own businesses"
ON public.businesses FOR DELETE
USING (auth.uid() = seller_id);

-- RLS Policies for franchises
-- Anyone can view active franchises
CREATE POLICY "Active franchises are publicly viewable"
ON public.franchises FOR SELECT
USING (status = 'active' OR auth.uid() = franchisor_id);

-- Franchisors can insert their own franchises
CREATE POLICY "Franchisors can create franchises"
ON public.franchises FOR INSERT
WITH CHECK (
  auth.uid() = franchisor_id AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('franchisor', 'admin')
  )
);

-- Franchisors can update their own franchises
CREATE POLICY "Franchisors can update own franchises"
ON public.franchises FOR UPDATE
USING (auth.uid() = franchisor_id);

-- Franchisors can delete their own franchises
CREATE POLICY "Franchisors can delete own franchises"
ON public.franchises FOR DELETE
USING (auth.uid() = franchisor_id);

-- RLS Policies for saved listings
CREATE POLICY "Users can view their own saved listings"
ON public.saved_listings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can save listings"
ON public.saved_listings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved listings"
ON public.saved_listings FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for inquiries
CREATE POLICY "Users can view their own inquiries"
ON public.inquiries FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send inquiries"
ON public.inquiries FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update inquiry status"
ON public.inquiries FOR UPDATE
USING (auth.uid() = recipient_id);

-- Function to auto-generate slug from name
CREATE OR REPLACE FUNCTION generate_unique_slug(base_text TEXT, table_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug
  base_slug := LOWER(REGEXP_REPLACE(base_text, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := TRIM(BOTH '-' FROM base_slug);
  final_slug := base_slug;
  
  -- Check if slug exists and add counter if needed
  WHILE EXISTS (
    SELECT 1 FROM public.businesses WHERE businesses.slug = final_slug
    UNION ALL
    SELECT 1 FROM public.franchises WHERE franchises.slug = final_slug
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::TEXT;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate slug for businesses
CREATE OR REPLACE FUNCTION auto_generate_business_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_unique_slug(NEW.name, 'businesses');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_business_slug
BEFORE INSERT ON public.businesses
FOR EACH ROW
EXECUTE FUNCTION auto_generate_business_slug();

-- Trigger to auto-generate slug for franchises
CREATE OR REPLACE FUNCTION auto_generate_franchise_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_unique_slug(NEW.brand_name, 'franchises');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_franchise_slug
BEFORE INSERT ON public.franchises
FOR EACH ROW
EXECUTE FUNCTION auto_generate_franchise_slug();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_business_view()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.businesses
  SET views_count = views_count + 1
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_franchise_view()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.franchises
  SET views_count = views_count + 1
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
