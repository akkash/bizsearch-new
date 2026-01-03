-- Migration: Autonomous Agents Infrastructure
-- Phase 4: Create tables for agent tasks, quote requests, and lead management

-- Agent Tasks table - tracks all agent activities
CREATE TABLE IF NOT EXISTS agent_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('quote_request', 'lead_response', 'availability_check', 'verification')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
    user_id UUID REFERENCES profiles(id),
    listing_id UUID,
    listing_type TEXT CHECK (listing_type IN ('business', 'franchise')),
    metadata JSONB DEFAULT '{}',
    result JSONB,
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quote Requests - when a user wants quotes from multiple listings
CREATE TABLE IF NOT EXISTS quote_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'collecting', 'completed', 'expired')),
    requirements JSONB DEFAULT '{}', -- what the user is looking for
    listing_ids UUID[] NOT NULL, -- array of business/franchise IDs
    listing_type TEXT NOT NULL CHECK (listing_type IN ('business', 'franchise')),
    responses JSONB DEFAULT '[]', -- collected quote responses
    comparison_data JSONB, -- AI-generated comparison
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quote Responses - individual responses from sellers/franchisors
CREATE TABLE IF NOT EXISTS quote_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_request_id UUID NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL,
    listing_type TEXT NOT NULL,
    responder_id UUID REFERENCES profiles(id), -- the seller/franchisor
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'responded', 'expired', 'declined')),
    initial_message TEXT, -- auto-generated inquiry
    response_message TEXT,
    response_data JSONB, -- structured quote data (price, terms, etc.)
    sent_at TIMESTAMPTZ,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead Queue - for auto-response agent
CREATE TABLE IF NOT EXISTS lead_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inquiry_id UUID NOT NULL, -- reference to the original inquiry
    listing_id UUID NOT NULL,
    listing_type TEXT NOT NULL CHECK (listing_type IN ('business', 'franchise')),
    seller_id UUID NOT NULL REFERENCES profiles(id),
    buyer_id UUID REFERENCES profiles(id),
    buyer_name TEXT,
    buyer_email TEXT,
    buyer_phone TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'auto_responded', 'qualified', 'contacted', 'converted', 'lost')),
    auto_response_sent BOOLEAN DEFAULT FALSE,
    auto_response_at TIMESTAMPTZ,
    qualification_score INT, -- AI-generated lead score 0-100
    qualification_notes JSONB,
    seller_notified BOOLEAN DEFAULT FALSE,
    seller_notified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Availability Checks - for verifying listings are still active
CREATE TABLE IF NOT EXISTS availability_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL,
    listing_type TEXT NOT NULL CHECK (listing_type IN ('business', 'franchise')),
    check_type TEXT NOT NULL CHECK (check_type IN ('social_signal', 'website_check', 'email_verification', 'owner_confirmation')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'checking', 'active', 'inactive', 'unresponsive', 'failed')),
    check_result JSONB,
    last_checked_at TIMESTAMPTZ,
    next_check_at TIMESTAMPTZ,
    consecutive_failures INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_tasks_user ON agent_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_type ON agent_tasks(type);
CREATE INDEX IF NOT EXISTS idx_quote_requests_user ON quote_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_responses_request ON quote_responses(quote_request_id);
CREATE INDEX IF NOT EXISTS idx_lead_queue_seller ON lead_queue(seller_id);
CREATE INDEX IF NOT EXISTS idx_lead_queue_status ON lead_queue(status);
CREATE INDEX IF NOT EXISTS idx_availability_checks_listing ON availability_checks(listing_id, listing_type);

-- RLS Policies
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_checks ENABLE ROW LEVEL SECURITY;

-- Users can view their own agent tasks
CREATE POLICY "Users can view own agent tasks"
ON agent_tasks FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can view their own quote requests
CREATE POLICY "Users can view own quote requests"
ON quote_requests FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can create quote requests
CREATE POLICY "Users can create quote requests"
ON quote_requests FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can view quote responses for their requests
CREATE POLICY "Users can view own quote responses"
ON quote_responses FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM quote_requests 
        WHERE quote_requests.id = quote_responses.quote_request_id 
        AND quote_requests.user_id = auth.uid()
    )
);

-- Sellers can view leads for their listings
CREATE POLICY "Sellers can view their leads"
ON lead_queue FOR SELECT
TO authenticated
USING (seller_id = auth.uid());

-- Admins can do everything
CREATE POLICY "Admins full access to agent_tasks"
ON agent_tasks FOR ALL
TO authenticated
USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admins full access to quote_requests"
ON quote_requests FOR ALL
TO authenticated
USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admins full access to quote_responses"
ON quote_responses FOR ALL
TO authenticated
USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admins full access to lead_queue"
ON lead_queue FOR ALL
TO authenticated
USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Admins full access to availability_checks"
ON availability_checks FOR ALL
TO authenticated
USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
