-- Admin RLS Policies Migration
-- Adds policies to allow admin users to manage all platform data

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================
-- PROFILES POLICIES
-- =====================

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (is_admin());

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
USING (is_admin());

-- =====================
-- BUSINESSES POLICIES
-- =====================

-- Admins can view all businesses (including drafts and pending)
CREATE POLICY "Admins can view all businesses"
ON public.businesses FOR SELECT
USING (is_admin());

-- Admins can update any business (for moderation)
CREATE POLICY "Admins can update any business"
ON public.businesses FOR UPDATE
USING (is_admin());

-- Admins can delete any business
CREATE POLICY "Admins can delete any business"
ON public.businesses FOR DELETE
USING (is_admin());

-- =====================
-- FRANCHISES POLICIES
-- =====================

-- Admins can view all franchises
CREATE POLICY "Admins can view all franchises"
ON public.franchises FOR SELECT
USING (is_admin());

-- Admins can update any franchise
CREATE POLICY "Admins can update any franchise"
ON public.franchises FOR UPDATE
USING (is_admin());

-- Admins can delete any franchise
CREATE POLICY "Admins can delete any franchise"
ON public.franchises FOR DELETE
USING (is_admin());

-- =====================
-- VERIFICATION_DOCUMENTS POLICIES
-- =====================

-- Admins can view all verification documents
CREATE POLICY "Admins can view all verification documents"
ON public.verification_documents FOR SELECT
USING (is_admin());

-- Admins can update verification documents
CREATE POLICY "Admins can update verification documents"
ON public.verification_documents FOR UPDATE
USING (is_admin());

-- =====================
-- ACTIVITY_LOGS POLICIES
-- =====================

-- Admins can view all activity logs
CREATE POLICY "Admins can view all activity logs"
ON public.activity_logs FOR SELECT
USING (is_admin());

-- =====================
-- Add rejection_reason column if it doesn't exist
-- =====================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'businesses' 
    AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE public.businesses ADD COLUMN rejection_reason TEXT;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'franchises' 
    AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE public.franchises ADD COLUMN rejection_reason TEXT;
  END IF;
END $$;

-- Grant execute on is_admin function
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
