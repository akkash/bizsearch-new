-- Franchise Locations Schema
-- Tracks existing franchise outlets and territory availability

-- Create enum for location status
CREATE TYPE location_status AS ENUM (
  'operating',
  'looking_for_franchise'
);

-- Create enum for territory status
CREATE TYPE territory_status AS ENUM (
  'available',
  'reserved',
  'occupied',
  'restricted'
);

-- Franchise Locations Table
CREATE TABLE public.franchise_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  franchise_id UUID NOT NULL REFERENCES public.franchises(id) ON DELETE CASCADE,
  
  -- Location Details
  location_name TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  country TEXT DEFAULT 'United States',
  
  -- Geographic Coordinates (for mapping)
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Status
  status location_status DEFAULT 'operating',
  opening_date DATE,
  closing_date DATE,
  
  -- Metadata
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Available Territories Table
CREATE TABLE public.franchise_territories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  franchise_id UUID NOT NULL REFERENCES public.franchises(id) ON DELETE CASCADE,
  
  -- Territory Definition
  territory_name TEXT NOT NULL,
  city TEXT,
  state TEXT NOT NULL,
  zip_codes TEXT[], -- Array of zip codes covered
  country TEXT DEFAULT 'United States',
  
  -- Geographic Bounds (polygon for map)
  territory_bounds JSONB, -- GeoJSON polygon
  center_latitude DECIMAL(10, 8),
  center_longitude DECIMAL(11, 8),
  
  -- Status & Pricing
  status territory_status DEFAULT 'available',
  franchise_fee DECIMAL(15, 2),
  estimated_investment_min DECIMAL(15, 2),
  estimated_investment_max DECIMAL(15, 2),
  
  -- Market Data
  population INTEGER,
  median_income DECIMAL(15, 2),
  competition_level TEXT, -- 'low', 'medium', 'high'
  market_potential_score INTEGER CHECK (market_potential_score >= 0 AND market_potential_score <= 100),
  
  -- Reserved Territory Info
  reserved_by UUID REFERENCES public.profiles(id),
  reserved_until DATE,
  
  -- Metadata
  description TEXT,
  available_from DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_franchise_locations_franchise_id ON public.franchise_locations(franchise_id);
CREATE INDEX idx_franchise_locations_status ON public.franchise_locations(status);
CREATE INDEX idx_franchise_locations_city_state ON public.franchise_locations(city, state);
CREATE INDEX idx_franchise_locations_coordinates ON public.franchise_locations(latitude, longitude);
CREATE INDEX idx_franchise_territories_franchise_id ON public.franchise_territories(franchise_id);
CREATE INDEX idx_franchise_territories_status ON public.franchise_territories(status);
CREATE INDEX idx_franchise_territories_state ON public.franchise_territories(state);

-- Updated_at trigger for franchise_locations
CREATE TRIGGER update_franchise_locations_updated_at
BEFORE UPDATE ON public.franchise_locations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Updated_at trigger for franchise_territories
CREATE TRIGGER update_franchise_territories_updated_at
BEFORE UPDATE ON public.franchise_territories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE public.franchise_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.franchise_territories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for franchise_locations
CREATE POLICY "Anyone can view franchise locations"
ON public.franchise_locations FOR SELECT
USING (true);

CREATE POLICY "Franchise owners can manage their locations"
ON public.franchise_locations FOR ALL
USING (
  franchise_id IN (
    SELECT id FROM franchises WHERE franchisor_id = auth.uid()
  )
);

CREATE POLICY "Verified users can view all locations"
ON public.franchise_locations FOR SELECT
USING (
  auth.uid() IN (
    SELECT id FROM profiles WHERE verified = true
  )
);

-- RLS Policies for franchise_territories
CREATE POLICY "Anyone can view available territories"
ON public.franchise_territories FOR SELECT
USING (status = 'available');

CREATE POLICY "Franchise owners can manage their territories"
ON public.franchise_territories FOR ALL
USING (
  franchise_id IN (
    SELECT id FROM franchises WHERE franchisor_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can view all territories"
ON public.franchise_territories FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Views for analytics

-- Location summary by franchise
CREATE VIEW franchise_location_summary AS
SELECT 
  f.id AS franchise_id,
  f.brand_name AS franchise_name,
  COUNT(fl.id) AS total_locations,
  COUNT(DISTINCT fl.state) AS states_covered,
  COUNT(DISTINCT fl.country) AS countries_covered,
  COUNT(CASE WHEN fl.status = 'operating' THEN 1 END) AS operating_count,
  COUNT(CASE WHEN fl.status = 'looking_for_franchise' THEN 1 END) AS looking_for_franchise_count,
  MIN(fl.opening_date) AS first_location_date,
  MAX(fl.opening_date) AS latest_location_date
FROM franchises f
LEFT JOIN franchise_locations fl ON f.id = fl.franchise_id
GROUP BY f.id, f.brand_name;

-- Territory availability summary
CREATE VIEW franchise_territory_summary AS
SELECT 
  f.id AS franchise_id,
  f.brand_name AS franchise_name,
  COUNT(ft.id) AS total_territories,
  COUNT(CASE WHEN ft.status = 'available' THEN 1 END) AS available_count,
  COUNT(CASE WHEN ft.status = 'reserved' THEN 1 END) AS reserved_count,
  COUNT(CASE WHEN ft.status = 'occupied' THEN 1 END) AS occupied_count,
  COUNT(DISTINCT ft.state) AS states_with_territories,
  AVG(ft.franchise_fee) AS avg_franchise_fee,
  AVG(ft.market_potential_score) AS avg_market_potential
FROM franchises f
LEFT JOIN franchise_territories ft ON f.id = ft.franchise_id
GROUP BY f.id, f.brand_name;

-- State-level franchise penetration
CREATE VIEW state_franchise_penetration AS
SELECT 
  state,
  COUNT(DISTINCT franchise_id) AS unique_franchises,
  COUNT(id) AS total_locations,
  COUNT(CASE WHEN status = 'operating' THEN 1 END) AS operating_locations
FROM franchise_locations
GROUP BY state
ORDER BY total_locations DESC;
