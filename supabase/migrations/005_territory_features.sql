-- Territory and Franchisee Features Migration

-- Saved Territories Table
CREATE TABLE public.saved_territories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  territory_id UUID NOT NULL REFERENCES public.franchise_territories(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, territory_id)
);

-- Territory Comparisons Table
CREATE TABLE public.territory_comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  territory_ids UUID[] NOT NULL,
  comparison_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Territory Requests Table
CREATE TABLE public.territory_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  territory_id UUID NOT NULL REFERENCES public.franchise_territories(id) ON DELETE CASCADE,
  franchise_id UUID NOT NULL REFERENCES public.franchises(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  response TEXT,
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Territory Waitlist Table
CREATE TABLE public.territory_waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  territory_id UUID NOT NULL REFERENCES public.franchise_territories(id) ON DELETE CASCADE,
  franchise_id UUID NOT NULL REFERENCES public.franchises(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL,
  notify_on_available BOOLEAN DEFAULT true,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, territory_id)
);

-- Indexes
CREATE INDEX idx_saved_territories_user_id ON public.saved_territories(user_id);
CREATE INDEX idx_saved_territories_territory_id ON public.saved_territories(territory_id);
CREATE INDEX idx_territory_comparisons_user_id ON public.territory_comparisons(user_id);
CREATE INDEX idx_territory_requests_user_id ON public.territory_requests(user_id);
CREATE INDEX idx_territory_requests_franchise_id ON public.territory_requests(franchise_id);
CREATE INDEX idx_territory_requests_status ON public.territory_requests(status);
CREATE INDEX idx_territory_waitlist_territory_id ON public.territory_waitlist(territory_id);
CREATE INDEX idx_territory_waitlist_user_id ON public.territory_waitlist(user_id);
CREATE INDEX idx_territory_waitlist_priority ON public.territory_waitlist(priority);

-- Updated_at triggers
CREATE TRIGGER update_territory_comparisons_updated_at
BEFORE UPDATE ON public.territory_comparisons
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_territory_requests_updated_at
BEFORE UPDATE ON public.territory_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE public.saved_territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.territory_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.territory_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.territory_waitlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies for saved_territories
CREATE POLICY "Users can manage their own saved territories"
ON public.saved_territories FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for territory_comparisons
CREATE POLICY "Users can manage their own comparisons"
ON public.territory_comparisons FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for territory_requests
CREATE POLICY "Users can view their own requests"
ON public.territory_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create requests"
ON public.territory_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Franchise owners can view requests for their franchises"
ON public.territory_requests FOR SELECT
USING (
  franchise_id IN (
    SELECT id FROM franchises WHERE franchisor_id = auth.uid()
  )
);

CREATE POLICY "Franchise owners can update requests for their franchises"
ON public.territory_requests FOR UPDATE
USING (
  franchise_id IN (
    SELECT id FROM franchises WHERE franchisor_id = auth.uid()
  )
);

-- RLS Policies for territory_waitlist
CREATE POLICY "Users can manage their own waitlist entries"
ON public.territory_waitlist FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Franchise owners can view waitlist for their territories"
ON public.territory_waitlist FOR SELECT
USING (
  franchise_id IN (
    SELECT id FROM franchises WHERE franchisor_id = auth.uid()
  )
);
