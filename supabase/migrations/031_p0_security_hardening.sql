-- P0 Security Hardening
-- Blocks privilege escalation, restricts public profile PII, hardens signup role assignment

-- ============================================
-- 1. Public profile view (no email/phone/financial PII)
-- ============================================
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  id,
  display_name,
  avatar_url,
  bio,
  location,
  city,
  state,
  country,
  website,
  linkedin_url,
  verified,
  verification_level,
  role,
  founded_year,
  employees,
  industry,
  total_outlets,
  created_at,
  updated_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- ============================================
-- 2. Tighten profiles SELECT — own row or admin only
-- ============================================
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- "Admins can view all profiles" already exists from 010_admin_rls_policies.sql

-- ============================================
-- 3. Block self-service role / verification escalation on profiles
-- ============================================
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'You are not allowed to change your role';
  END IF;

  IF NEW.verified IS DISTINCT FROM OLD.verified AND NOT public.is_admin() THEN
    NEW.verified := OLD.verified;
  END IF;

  IF NEW.verification_level IS DISTINCT FROM OLD.verification_level AND NOT public.is_admin() THEN
    NEW.verification_level := OLD.verification_level;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_privilege_escalation ON public.profiles;
CREATE TRIGGER prevent_profile_privilege_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- ============================================
-- 4. Restrict profile_roles to non-admin self-service roles
-- ============================================
DROP POLICY IF EXISTS "Users can insert own roles" ON public.profile_roles;
DROP POLICY IF EXISTS "Users can update own roles" ON public.profile_roles;

CREATE POLICY "Users can insert own non-admin roles"
ON public.profile_roles FOR INSERT
WITH CHECK (
  auth.uid() = profile_id
  AND role IN ('seller', 'buyer', 'franchisor', 'franchisee', 'advisor', 'broker')
);

CREATE POLICY "Users can update own non-admin roles"
ON public.profile_roles FOR UPDATE
USING (auth.uid() = profile_id)
WITH CHECK (
  auth.uid() = profile_id
  AND role IN ('seller', 'buyer', 'franchisor', 'franchisee', 'advisor', 'broker')
);

CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'admin' AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'You are not allowed to assign the admin role';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_role_escalation ON public.profile_roles;
CREATE TRIGGER prevent_profile_role_escalation
BEFORE INSERT OR UPDATE ON public.profile_roles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- ============================================
-- 5. Harden signup — ignore admin/metadata privilege injection
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_role TEXT;
  safe_role public.user_role;
BEGIN
  requested_role := lower(trim(COALESCE(NEW.raw_user_meta_data->>'role', '')));

  IF requested_role IN ('seller', 'buyer', 'franchisor', 'franchisee', 'advisor', 'broker') THEN
    safe_role := requested_role::public.user_role;
  ELSE
    safe_role := 'buyer';
  END IF;

  INSERT INTO public.profiles (id, email, phone, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone),
    COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
    safe_role
  );

  INSERT INTO public.profile_roles (profile_id, role, is_primary)
  VALUES (NEW.id, safe_role, TRUE)
  ON CONFLICT (profile_id, role) DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

COMMENT ON VIEW public.public_profiles IS 'Public-safe profile fields — excludes email, phone, and financial PII';
COMMENT ON FUNCTION public.prevent_profile_privilege_escalation() IS 'P0: blocks non-admin role/verification self-escalation';
COMMENT ON FUNCTION public.prevent_profile_role_escalation() IS 'P0: blocks non-admin admin role assignment via profile_roles';
