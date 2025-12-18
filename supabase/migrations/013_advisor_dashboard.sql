-- Migration: Add advisor/broker dashboard tables
-- For client management, deal pipeline, commissions, and advisor directory

-- Advisor Clients Table (CRM)
CREATE TABLE IF NOT EXISTS public.advisor_clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    advisor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    type TEXT DEFAULT 'buyer' CHECK (type IN ('buyer', 'seller', 'both')),
    status TEXT DEFAULT 'prospect' CHECK (status IN ('active', 'inactive', 'prospect')),
    budget_min BIGINT,
    budget_max BIGINT,
    interests TEXT[],
    notes TEXT,
    last_contact TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deal Pipeline Table
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    advisor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    client_id UUID REFERENCES public.advisor_clients(id) ON DELETE SET NULL,
    listing_id UUID,
    listing_type TEXT CHECK (listing_type IN ('business', 'franchise')),
    listing_name TEXT,
    value BIGINT NOT NULL DEFAULT 0,
    stage TEXT DEFAULT 'lead' CHECK (stage IN ('lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
    probability INTEGER DEFAULT 10,
    expected_close DATE,
    notes TEXT,
    last_activity TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commissions Table
CREATE TABLE IF NOT EXISTS public.commissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    advisor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
    deal_title TEXT NOT NULL,
    listing_name TEXT,
    client_name TEXT,
    deal_value BIGINT NOT NULL,
    commission_rate DECIMAL(5,2) NOT NULL,
    commission_amount BIGINT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
    closed_date DATE NOT NULL,
    payment_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Advisor Profiles (Extended)
CREATE TABLE IF NOT EXISTS public.advisor_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    company TEXT,
    location TEXT,
    specializations TEXT[],
    bio TEXT,
    years_experience INTEGER DEFAULT 0,
    deals_closed INTEGER DEFAULT 0,
    total_value BIGINT DEFAULT 0,
    rating DECIMAL(2,1) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Advisor Reviews
CREATE TABLE IF NOT EXISTS public.advisor_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    advisor_id UUID REFERENCES public.advisor_profiles(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_advisor_clients_advisor ON public.advisor_clients(advisor_id);
CREATE INDEX IF NOT EXISTS idx_advisor_clients_status ON public.advisor_clients(status);

CREATE INDEX IF NOT EXISTS idx_deals_advisor ON public.deals(advisor_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON public.deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_expected_close ON public.deals(expected_close);

CREATE INDEX IF NOT EXISTS idx_commissions_advisor ON public.commissions(advisor_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.commissions(status);

CREATE INDEX IF NOT EXISTS idx_advisor_profiles_verified ON public.advisor_profiles(verified);
CREATE INDEX IF NOT EXISTS idx_advisor_profiles_featured ON public.advisor_profiles(featured);
CREATE INDEX IF NOT EXISTS idx_advisor_profiles_rating ON public.advisor_profiles(rating DESC);

-- RLS Policies
ALTER TABLE public.advisor_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_reviews ENABLE ROW LEVEL SECURITY;

-- Advisor Clients: Only advisor can see their clients
CREATE POLICY "Advisors can manage own clients"
ON public.advisor_clients FOR ALL
USING (auth.uid() = advisor_id);

-- Deals: Only advisor can see their deals
CREATE POLICY "Advisors can manage own deals"
ON public.deals FOR ALL
USING (auth.uid() = advisor_id);

-- Commissions: Only advisor can see their commissions
CREATE POLICY "Advisors can view own commissions"
ON public.commissions FOR SELECT
USING (auth.uid() = advisor_id);

-- Advisor Profiles: Public read, own write
CREATE POLICY "Anyone can view advisor profiles"
ON public.advisor_profiles FOR SELECT
USING (true);

CREATE POLICY "Users can manage own advisor profile"
ON public.advisor_profiles FOR ALL
USING (auth.uid() = id);

-- Advisor Reviews: Public read, authenticated write
CREATE POLICY "Anyone can view reviews"
ON public.advisor_reviews FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can write reviews"
ON public.advisor_reviews FOR INSERT
WITH CHECK (auth.uid() = reviewer_id);

-- Admin access
CREATE POLICY "Admins can manage all clients"
ON public.advisor_clients FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins can manage all deals"
ON public.deals FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins can manage all commissions"
ON public.commissions FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins can manage all advisor profiles"
ON public.advisor_profiles FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Function to update advisor stats on deal close
CREATE OR REPLACE FUNCTION update_advisor_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stage = 'closed_won' AND OLD.stage != 'closed_won' THEN
        UPDATE public.advisor_profiles
        SET 
            deals_closed = deals_closed + 1,
            total_value = total_value + NEW.value,
            updated_at = NOW()
        WHERE id = NEW.advisor_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_advisor_stats
    AFTER UPDATE ON public.deals
    FOR EACH ROW
    EXECUTE FUNCTION update_advisor_stats();
