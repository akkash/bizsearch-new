-- Migration: Add business seller features tables
-- For buyer inquiries, NDAs, and deal room

-- Business Inquiries Table
CREATE TABLE IF NOT EXISTS public.business_inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'approved', 'rejected')),
    nda_signed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NDA Agreements Table
CREATE TABLE IF NOT EXISTS public.nda_agreements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'viewed', 'signed', 'expired')),
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    viewed_at TIMESTAMPTZ,
    signed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '2 years'),
    custom_terms TEXT,
    signature_data JSONB
);

-- Deal Room Documents Table
CREATE TABLE IF NOT EXISTS public.deal_room_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    category TEXT DEFAULT 'overview' CHECK (category IN ('financial', 'legal', 'operational', 'overview')),
    size_bytes INTEGER,
    access_level TEXT DEFAULT 'nda_signed' CHECK (access_level IN ('all', 'nda_signed')),
    uploaded_by UUID REFERENCES auth.users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deal Room Activity Log
CREATE TABLE IF NOT EXISTS public.deal_room_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    document_id UUID REFERENCES public.deal_room_documents(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listing Analytics Table
CREATE TABLE IF NOT EXISTS public.listing_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID NOT NULL,
    listing_type TEXT NOT NULL CHECK (listing_type IN ('business', 'franchise')),
    event_type TEXT NOT NULL CHECK (event_type IN ('view', 'save', 'inquiry', 'share')),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id TEXT,
    location TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_business_inquiries_business ON public.business_inquiries(business_id);
CREATE INDEX IF NOT EXISTS idx_business_inquiries_buyer ON public.business_inquiries(buyer_id);
CREATE INDEX IF NOT EXISTS idx_business_inquiries_status ON public.business_inquiries(status);

CREATE INDEX IF NOT EXISTS idx_nda_business ON public.nda_agreements(business_id);
CREATE INDEX IF NOT EXISTS idx_nda_buyer ON public.nda_agreements(buyer_id);
CREATE INDEX IF NOT EXISTS idx_nda_status ON public.nda_agreements(status);

CREATE INDEX IF NOT EXISTS idx_deal_room_docs_business ON public.deal_room_documents(business_id);
CREATE INDEX IF NOT EXISTS idx_deal_room_activity_business ON public.deal_room_activity(business_id);

CREATE INDEX IF NOT EXISTS idx_listing_analytics_listing ON public.listing_analytics(listing_id, listing_type);
CREATE INDEX IF NOT EXISTS idx_listing_analytics_created ON public.listing_analytics(created_at DESC);

-- RLS Policies for Business Inquiries
ALTER TABLE public.business_inquiries ENABLE ROW LEVEL SECURITY;

-- Buyers can view their own inquiries
CREATE POLICY "Buyers can view own inquiries"
ON public.business_inquiries FOR SELECT
USING (auth.uid() = buyer_id);

-- Buyers can create inquiries
CREATE POLICY "Buyers can create inquiries"
ON public.business_inquiries FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

-- Business owners can view inquiries for their businesses
CREATE POLICY "Owners can view inquiries"
ON public.business_inquiries FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.businesses
        WHERE id = business_id AND seller_id = auth.uid()
    )
);

-- Business owners can update inquiry status
CREATE POLICY "Owners can update inquiries"
ON public.business_inquiries FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.businesses
        WHERE id = business_id AND seller_id = auth.uid()
    )
);

-- RLS for NDA Agreements
ALTER TABLE public.nda_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view their NDAs"
ON public.nda_agreements FOR SELECT
USING (auth.uid() = buyer_id);

CREATE POLICY "Owners can manage NDAs"
ON public.nda_agreements FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.businesses
        WHERE id = business_id AND seller_id = auth.uid()
    )
);

-- RLS for Deal Room Documents
ALTER TABLE public.deal_room_documents ENABLE ROW LEVEL SECURITY;

-- Public documents for all
CREATE POLICY "Anyone can view public documents"
ON public.deal_room_documents FOR SELECT
USING (access_level = 'all');

-- NDA-signed buyers can view restricted documents
CREATE POLICY "NDA buyers can view restricted documents"
ON public.deal_room_documents FOR SELECT
USING (
    access_level = 'nda_signed' AND
    EXISTS (
        SELECT 1 FROM public.nda_agreements
        WHERE nda_agreements.business_id = deal_room_documents.business_id
        AND nda_agreements.buyer_id = auth.uid()
        AND nda_agreements.status = 'signed'
    )
);

-- Owners can manage their documents
CREATE POLICY "Owners can manage documents"
ON public.deal_room_documents FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.businesses
        WHERE id = business_id AND seller_id = auth.uid()
    )
);

-- RLS for Deal Room Activity
ALTER TABLE public.deal_room_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view activity"
ON public.deal_room_activity FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.businesses
        WHERE id = business_id AND seller_id = auth.uid()
    )
);

-- RLS for Listing Analytics
ALTER TABLE public.listing_analytics ENABLE ROW LEVEL SECURITY;

-- Listing owners can view analytics
CREATE POLICY "Owners can view business analytics"
ON public.listing_analytics FOR SELECT
USING (
    listing_type = 'business' AND
    EXISTS (
        SELECT 1 FROM public.businesses
        WHERE id = listing_id AND seller_id = auth.uid()
    )
);

CREATE POLICY "Owners can view franchise analytics"
ON public.listing_analytics FOR SELECT
USING (
    listing_type = 'franchise' AND
    EXISTS (
        SELECT 1 FROM public.franchises
        WHERE id = listing_id AND franchisor_id = auth.uid()
    )
);

-- Anyone can log analytics (for tracking views)
CREATE POLICY "Anyone can log analytics"
ON public.listing_analytics FOR INSERT
WITH CHECK (true);

-- Admin access to all
CREATE POLICY "Admins can view all inquiries"
ON public.business_inquiries FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins can manage all NDAs"
ON public.nda_agreements FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins can manage all documents"
ON public.deal_room_documents FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins can view all analytics"
ON public.listing_analytics FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);
