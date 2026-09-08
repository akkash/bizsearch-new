-- P0 Franchise Pipeline: qualification spine, inquiry↔application link, views RPC, stage expansion

-- 1) Link applications to inquiries
ALTER TABLE public.franchise_applications
  ADD COLUMN IF NOT EXISTS inquiry_id UUID REFERENCES public.inquiries(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_franchise_applications_inquiry_id
  ON public.franchise_applications(inquiry_id);

-- 2) Structured qualification fields on inquiries (also mirrored in metadata for display)
ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS investment_capacity TEXT,
  ADD COLUMN IF NOT EXISTS preferred_location TEXT,
  ADD COLUMN IF NOT EXISTS opening_timeline TEXT,
  ADD COLUMN IF NOT EXISTS funds_available TEXT,
  ADD COLUMN IF NOT EXISTS relevant_experience TEXT,
  ADD COLUMN IF NOT EXISTS match_score INTEGER;

-- 3) Expand pipeline statuses for Agreement / Opened
ALTER TABLE public.inquiries DROP CONSTRAINT IF EXISTS inquiries_status_check;

ALTER TABLE public.inquiries
  ADD CONSTRAINT inquiries_status_check
  CHECK (status IN (
    'new',
    'contacted',
    'qualified',
    'information_sent',
    'meeting',
    'application',
    'negotiation',
    'agreement',
    'opened',
    'converted',
    'lost'
  ));

-- 4) Callable RPC for franchise view counts (app expects this name)
CREATE OR REPLACE FUNCTION public.increment_franchise_views(franchise_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.franchises
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = franchise_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_franchise_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_franchise_views(UUID) TO anon;

-- 5) India-friendly defaults for new location/territory rows
ALTER TABLE public.franchise_locations
  ALTER COLUMN country SET DEFAULT 'India';

ALTER TABLE public.franchise_territories
  ALTER COLUMN country SET DEFAULT 'India';
