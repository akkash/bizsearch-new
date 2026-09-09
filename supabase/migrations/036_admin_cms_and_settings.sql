-- Platform settings, CMS pages, and announcements for admin console

CREATE TABLE IF NOT EXISTS public.platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage platform settings"
ON public.platform_settings FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

INSERT INTO public.platform_settings (key, value) VALUES
  ('general', '{"platformName":"BizSearch","supportEmail":"support@bizsearch.com","contactPhone":""}'::jsonb),
  ('listings', '{"listingApprovalRequired":true,"maxImagesPerListing":10,"listingFee":0,"featuredListingFee":999}'::jsonb),
  ('notifications', '{"emailNotifications":true,"smsNotifications":false,"newListingAlerts":true,"newUserAlerts":true}'::jsonb),
  ('security', '{"requireEmailVerification":true,"requirePhoneVerification":false,"maxLoginAttempts":5,"sessionTimeout":30}'::jsonb)
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.cms_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  body TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cms_pages_status ON public.cms_pages(status);
CREATE INDEX IF NOT EXISTS idx_cms_pages_slug ON public.cms_pages(slug);

ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published cms pages"
ON public.cms_pages FOR SELECT
USING (status = 'published' OR public.is_admin());

CREATE POLICY "Admins manage cms pages"
ON public.cms_pages FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.platform_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('feature', 'info', 'maintenance', 'alert')),
  active BOOLEAN NOT NULL DEFAULT FALSE,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_announcements_active ON public.platform_announcements(active);

ALTER TABLE public.platform_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active announcements"
ON public.platform_announcements FOR SELECT
USING (
  (active = TRUE AND (starts_at IS NULL OR starts_at <= NOW()) AND (ends_at IS NULL OR ends_at >= NOW()))
  OR public.is_admin()
);

CREATE POLICY "Admins manage announcements"
ON public.platform_announcements FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());
