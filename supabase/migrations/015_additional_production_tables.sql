-- Migration 015: Additional tables and columns for mock data replacement
-- Adds missing tables and columns required by the production codebase

-- =====================
-- FRAUD ALERTS TABLE
-- =====================
-- Required by: admin-fraud-alerts.tsx

CREATE TABLE IF NOT EXISTS public.fraud_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('listing', 'user', 'transaction')),
    entity_id UUID NOT NULL,
    entity_name TEXT NOT NULL,
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'confirmed')),
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fraud_alerts
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_status ON public.fraud_alerts(status);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_type ON public.fraud_alerts(type);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_created ON public.fraud_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_risk ON public.fraud_alerts(risk_score DESC);

-- RLS for fraud_alerts
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;

-- Only admins can view fraud alerts
CREATE POLICY "Admins can manage fraud alerts"
ON public.fraud_alerts FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- =====================
-- ADD MISSING COLUMNS TO DEALS TABLE
-- =====================
-- Required by: deal-pipeline.tsx

DO $$
BEGIN
    -- Add client_name to deals table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deals' AND column_name = 'client_name'
    ) THEN
        ALTER TABLE public.deals ADD COLUMN client_name TEXT;
    END IF;
END $$;

-- Update deals to populate client_name from linked clients
UPDATE public.deals d
SET client_name = ac.name
FROM public.advisor_clients ac
WHERE d.client_id = ac.id AND d.client_name IS NULL;

-- =====================
-- ADD user_id COLUMN TO verification_documents
-- =====================
-- Required by: profile-documents.tsx (uses user_id instead of profile_id)

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'verification_documents' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.verification_documents ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        
        -- Copy profile_id to user_id if profile_id exists
        UPDATE public.verification_documents SET user_id = profile_id WHERE user_id IS NULL AND profile_id IS NOT NULL;
    END IF;
END $$;

-- Create index on user_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_verification_documents_user_id ON public.verification_documents(user_id);

-- Add additional RLS policy for user_id access
DROP POLICY IF EXISTS "Users can view own documents by user_id" ON public.verification_documents;
CREATE POLICY "Users can view own documents by user_id"
ON public.verification_documents FOR SELECT
USING (auth.uid() = user_id);

-- =====================
-- ADD MISSING COLUMNS TO BUSINESSES FOR ANALYTICS
-- =====================
-- Required by: seller-analytics.tsx

DO $$
BEGIN
    -- Ensure saves_count exists on businesses
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'businesses' AND column_name = 'saves_count'
    ) THEN
        ALTER TABLE public.businesses ADD COLUMN saves_count INTEGER DEFAULT 0;
    END IF;
    
    -- Ensure saves_count exists on franchises
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'franchises' AND column_name = 'saves_count'
    ) THEN
        ALTER TABLE public.franchises ADD COLUMN saves_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- =====================
-- ADD user_name AND timestamp COLUMNS TO DEAL_ROOM_ACTIVITY
-- =====================
-- Required by: deal-room.tsx (expects user_name and timestamp)

DO $$
BEGIN
    -- Add user_name column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deal_room_activity' AND column_name = 'user_name'
    ) THEN
        ALTER TABLE public.deal_room_activity ADD COLUMN user_name TEXT;
    END IF;
    
    -- Add timestamp alias column if not exists (in addition to created_at)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deal_room_activity' AND column_name = 'timestamp'
    ) THEN
        ALTER TABLE public.deal_room_activity ADD COLUMN timestamp TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    -- Add document column (for document name reference instead of document_id)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deal_room_activity' AND column_name = 'document'
    ) THEN
        ALTER TABLE public.deal_room_activity ADD COLUMN document TEXT;
    END IF;
END $$;

-- Populate user_name from profiles if empty
UPDATE public.deal_room_activity dra
SET user_name = p.display_name
FROM public.profiles p
WHERE dra.user_id = p.id AND dra.user_name IS NULL;

-- Copy created_at to timestamp if timestamp is null
UPDATE public.deal_room_activity
SET timestamp = created_at
WHERE timestamp IS NULL AND created_at IS NOT NULL;

-- =====================
-- ADD size COLUMN TO DEAL_ROOM_DOCUMENTS (alias for size_bytes)
-- =====================
-- Required by: deal-room.tsx (expects 'size' not 'size_bytes')

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'deal_room_documents' AND column_name = 'size'
    ) THEN
        ALTER TABLE public.deal_room_documents ADD COLUMN size INTEGER;
    END IF;
END $$;

-- Copy size_bytes to size if size is null
UPDATE public.deal_room_documents
SET size = size_bytes
WHERE size IS NULL AND size_bytes IS NOT NULL;

-- =====================
-- ADD user_id TO ACTIVITY_LOGS (alias for profile_id)
-- =====================
-- Required by: admin-service.ts (uses user_id)

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'activity_logs' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.activity_logs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        
        -- Copy profile_id to user_id if profile_id exists
        UPDATE public.activity_logs SET user_id = profile_id WHERE user_id IS NULL AND profile_id IS NOT NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);

-- Add policy for user_id access
DROP POLICY IF EXISTS "Users can view own activity by user_id" ON public.activity_logs;
CREATE POLICY "Users can view own activity by user_id"
ON public.activity_logs FOR SELECT
USING (auth.uid() = user_id);

-- =====================
-- GRANT EXECUTE PERMISSIONS
-- =====================

GRANT EXECUTE ON FUNCTION increment_inquiry_count(TEXT, UUID) TO authenticated;

-- =====================
-- UPDATE TIMESTAMP TRIGGER FOR FRAUD ALERTS
-- =====================

CREATE OR REPLACE FUNCTION update_fraud_alert_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_fraud_alert_timestamp ON public.fraud_alerts;
CREATE TRIGGER trigger_update_fraud_alert_timestamp
    BEFORE UPDATE ON public.fraud_alerts
    FOR EACH ROW
    EXECUTE FUNCTION update_fraud_alert_timestamp();
