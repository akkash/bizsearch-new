-- P1: unified admin check, meeting fields, saved-search alerts, Gemini quota.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  )
  OR EXISTS (
    SELECT 1 FROM public.profile_roles
    WHERE profile_id = auth.uid()
      AND role = 'admin'
  );
END;
$$;

COMMENT ON FUNCTION public.is_admin() IS
  'True when profiles.role or profile_roles contains admin.';

ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS meeting_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS meeting_notes TEXT;

CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query TEXT,
  industry TEXT,
  city TEXT,
  budget_max NUMERIC,
  last_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user
  ON public.saved_searches(user_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_searches_dedupe
  ON public.saved_searches (
    user_id,
    COALESCE(query, ''),
    COALESCE(industry, ''),
    COALESCE(city, ''),
    COALESCE(budget_max, -1)
  );

ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own saved searches" ON public.saved_searches;
CREATE POLICY "Users manage own saved searches"
ON public.saved_searches FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.gemini_usage (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  used_on DATE NOT NULL DEFAULT CURRENT_DATE,
  call_count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, used_on)
);

ALTER TABLE public.gemini_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own gemini usage" ON public.gemini_usage;
CREATE POLICY "Users can view own gemini usage"
ON public.gemini_usage FOR SELECT
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.consume_gemini_quota(p_max INTEGER DEFAULT 20)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.gemini_usage (user_id, used_on, call_count)
  VALUES (auth.uid(), CURRENT_DATE, 1)
  ON CONFLICT (user_id, used_on)
  DO UPDATE SET call_count = public.gemini_usage.call_count + 1
  RETURNING call_count INTO current_count;

  IF current_count > p_max THEN
    UPDATE public.gemini_usage
    SET call_count = call_count - 1
    WHERE user_id = auth.uid()
      AND used_on = CURRENT_DATE;
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.consume_gemini_quota(INTEGER) TO authenticated;

CREATE OR REPLACE FUNCTION public.notify_saved_search_matches()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  search_row RECORD;
  listing_name TEXT;
  cities TEXT;
BEGIN
  IF NEW.status IS DISTINCT FROM 'active' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status = 'active' THEN
    RETURN NEW;
  END IF;

  listing_name := COALESCE(NEW.brand_name, 'A franchise');
  cities := lower(concat_ws(' ',
    COALESCE(NEW.headquarters_city, ''),
    COALESCE(NEW.preferred_cities::text, '')
  ));

  FOR search_row IN
    SELECT *
    FROM public.saved_searches
    WHERE (industry IS NULL OR industry = NEW.industry)
      AND (
        city IS NULL
        OR cities LIKE '%' || lower(city) || '%'
      )
      AND (
        budget_max IS NULL
        OR NEW.total_investment_min IS NULL
        OR NEW.total_investment_min <= budget_max
      )
      AND (
        query IS NULL
        OR NEW.brand_name ILIKE '%' || query || '%'
        OR COALESCE(NEW.description, '') ILIKE '%' || query || '%'
        OR COALESCE(NEW.industry, '') ILIKE '%' || query || '%'
      )
  LOOP
    PERFORM public.create_notification(
      search_row.user_id,
      'saved_listing_update',
      'New match for ' || search_row.name,
      listing_name || ' matches a search you saved.',
      '/franchise/' || COALESCE(NEW.slug, NEW.id::text),
      jsonb_build_object(
        'saved_search_id', search_row.id,
        'listing_id', NEW.id
      )
    );

    UPDATE public.saved_searches
    SET last_notified_at = NOW()
    WHERE id = search_row.id;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_franchise_saved_search_match ON public.franchises;
CREATE TRIGGER on_franchise_saved_search_match
AFTER INSERT OR UPDATE OF status ON public.franchises
FOR EACH ROW
EXECUTE FUNCTION public.notify_saved_search_matches();

INSERT INTO public.feature_flags (key, name, description, enabled, category)
VALUES
  ('ai_features', 'AI Features master', 'Master switch checked before any Gemini call', true, 'ai_features')
ON CONFLICT (key) DO NOTHING;
