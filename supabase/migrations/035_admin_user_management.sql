-- Admin user management: ban flag + profile_roles admin policies

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON public.profiles (is_banned)
  WHERE is_banned = TRUE;

-- Admins can manage any user's roles (change role, assign admin)
DROP POLICY IF EXISTS "Admins can manage profile roles" ON public.profile_roles;
CREATE POLICY "Admins can manage profile roles"
ON public.profile_roles
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Admins can insert activity logs (ban/role audit trail)
DROP POLICY IF EXISTS "Admins can insert activity logs" ON public.activity_logs;
CREATE POLICY "Admins can insert activity logs"
ON public.activity_logs FOR INSERT
WITH CHECK (public.is_admin());

COMMENT ON COLUMN public.profiles.is_banned IS 'When true, user should be blocked from platform actions (admin-set)';
