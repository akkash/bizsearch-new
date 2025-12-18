-- Migration 016: Add phone verification fields to profiles
-- For email-based auth with phone verification as separate step

-- Add phone_verified column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'profiles' 
        AND column_name = 'phone_verified'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'profiles' 
        AND column_name = 'phone_verified_at'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN phone_verified_at TIMESTAMPTZ;
    END IF;
END $$;

-- Create index for phone verification status
CREATE INDEX IF NOT EXISTS idx_profiles_phone_verified ON public.profiles(phone_verified);
