-- Migration: Comprehensive inquiries table for production
-- Consolidates all inquiry/lead tracking needs

-- Drop and recreate inquiries table with full schema
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL,
    listing_type TEXT NOT NULL CHECK (listing_type IN ('business', 'franchise')),
    subject TEXT,
    message TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'hot')),
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    read_at TIMESTAMPTZ,
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inquiries_recipient ON public.inquiries(recipient_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_sender ON public.inquiries(sender_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_listing ON public.inquiries(listing_id, listing_type);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON public.inquiries(created_at DESC);

-- RLS Policies
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Senders can view their own inquiries
CREATE POLICY "Senders can view own inquiries"
ON public.inquiries FOR SELECT
USING (auth.uid() = sender_id);

-- Recipients can view inquiries sent to them
CREATE POLICY "Recipients can view received inquiries"
ON public.inquiries FOR SELECT
USING (auth.uid() = recipient_id);

-- Anyone can create inquiries (including anonymous)
CREATE POLICY "Anyone can create inquiries"
ON public.inquiries FOR INSERT
WITH CHECK (true);

-- Recipients can update inquiries they received
CREATE POLICY "Recipients can update inquiries"
ON public.inquiries FOR UPDATE
USING (auth.uid() = recipient_id);

-- Admins can manage all inquiries
CREATE POLICY "Admins can manage all inquiries"
ON public.inquiries FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Function to increment inquiry count
CREATE OR REPLACE FUNCTION increment_inquiry_count(p_table TEXT, p_id UUID)
RETURNS VOID AS $$
BEGIN
    IF p_table = 'businesses' THEN
        UPDATE public.businesses
        SET inquiries_count = COALESCE(inquiries_count, 0) + 1
        WHERE id = p_id;
    ELSIF p_table = 'franchises' THEN
        UPDATE public.franchises
        SET inquiries_count = COALESCE(inquiries_count, 0) + 1
        WHERE id = p_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add inquiries_count column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'businesses' AND column_name = 'inquiries_count'
    ) THEN
        ALTER TABLE public.businesses ADD COLUMN inquiries_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'franchises' AND column_name = 'inquiries_count'
    ) THEN
        ALTER TABLE public.franchises ADD COLUMN inquiries_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Trigger to update timestamp
CREATE OR REPLACE FUNCTION update_inquiry_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_inquiry_timestamp ON public.inquiries;
CREATE TRIGGER trigger_update_inquiry_timestamp
    BEFORE UPDATE ON public.inquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_inquiry_timestamp();

-- Create notifications for new inquiries
CREATE OR REPLACE FUNCTION notify_new_inquiry()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (
        user_id,
        type,
        title,
        message,
        metadata
    ) VALUES (
        NEW.recipient_id,
        'inquiry',
        'New Inquiry Received',
        'You have a new inquiry about your listing',
        jsonb_build_object(
            'inquiry_id', NEW.id,
            'listing_id', NEW.listing_id,
            'listing_type', NEW.listing_type,
            'sender_email', NEW.contact_email
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_new_inquiry ON public.inquiries;
CREATE TRIGGER trigger_notify_new_inquiry
    AFTER INSERT ON public.inquiries
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_inquiry();
