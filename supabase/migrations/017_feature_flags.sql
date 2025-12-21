-- Feature Flags Table
-- Enables admins to toggle platform features on/off for controlled rollouts

CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT false,
    category VARCHAR(50) DEFAULT 'core',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index on key for fast lookups
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(key);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_feature_flags_category ON feature_flags(category);

-- RLS Policies
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read feature flags
CREATE POLICY "Feature flags are viewable by everyone"
ON feature_flags FOR SELECT
TO authenticated
USING (true);

-- Allow public read for unauthenticated users too (needed for app initialization)
CREATE POLICY "Feature flags are viewable by public"
ON feature_flags FOR SELECT
TO anon
USING (true);

-- Only admins can update feature flags
CREATE POLICY "Only admins can update feature flags"
ON feature_flags FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Only admins can insert feature flags
CREATE POLICY "Only admins can insert feature flags"
ON feature_flags FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Only admins can delete feature flags
CREATE POLICY "Only admins can delete feature flags"
ON feature_flags FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Seed default feature flags
INSERT INTO feature_flags (key, name, description, enabled, category) VALUES
    ('franchise_map', 'Franchise Map Discovery', 'Interactive map for discovering franchise locations', true, 'maps'),
    ('territory_analytics', 'Territory Analytics', 'AI-powered territory analysis and recommendations', true, 'maps'),
    ('ai_matching', 'AI Business Matching', 'AI-powered matching between buyers and businesses', true, 'ai_features'),
    ('ai_fraud_detection', 'AI Fraud Detection', 'AI system to detect fraudulent listings', true, 'security'),
    ('ai_valuation', 'AI Business Valuation', 'Automated business valuation using AI', false, 'ai_features'),
    ('ai_chat_advisor', 'AI Chat Advisor', 'AI-powered chat assistant for guidance', false, 'ai_features'),
    ('ai_document_analyzer', 'AI Document Analyzer', 'AI analysis of business documents', false, 'ai_features'),
    ('deal_room', 'Deal Room', 'Virtual deal room for negotiations', true, 'core'),
    ('nda_management', 'NDA Management', 'Digital NDA signing and management', true, 'core'),
    ('notifications', 'Push Notifications', 'Real-time push notifications', true, 'core'),
    ('saved_searches', 'Saved Searches', 'Save search criteria for alerts', true, 'core'),
    ('advanced_analytics', 'Advanced Analytics', 'Enhanced analytics dashboard', false, 'beta'),
    ('bulk_messaging', 'Bulk Messaging', 'Send messages to multiple users', false, 'beta'),
    ('maintenance_mode', 'Maintenance Mode', 'Put platform in maintenance mode', false, 'system')
ON CONFLICT (key) DO NOTHING;

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_feature_flags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on changes
DROP TRIGGER IF EXISTS trigger_feature_flags_updated_at ON feature_flags;
CREATE TRIGGER trigger_feature_flags_updated_at
    BEFORE UPDATE ON feature_flags
    FOR EACH ROW
    EXECUTE FUNCTION update_feature_flags_updated_at();
