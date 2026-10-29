-- Catalog accounts hold franchise listings until an admin maps them to the real owner.
-- The map function also moves enquiries and conversations, which admin RLS cannot update.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_catalog_account BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_profiles_is_catalog_account
  ON public.profiles (is_catalog_account)
  WHERE is_catalog_account = TRUE;

UPDATE public.profiles
SET is_catalog_account = TRUE
WHERE lower(email) = 'franchise-india-catalog@test.example'
  AND is_catalog_account = FALSE;

COMMENT ON COLUMN public.profiles.is_catalog_account IS
  'When true, this account holds franchise listings that an admin can later map to a real owner';

-- Admins need to read enquiry counts for catalog-held franchises.
DROP POLICY IF EXISTS "Admins can view all inquiries" ON public.inquiries;
CREATE POLICY "Admins can view all inquiries"
ON public.inquiries FOR SELECT
USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.prevent_catalog_flag_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_catalog_account IS DISTINCT FROM OLD.is_catalog_account
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'You are not allowed to change catalog status';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_catalog_flag_escalation ON public.profiles;
CREATE TRIGGER prevent_catalog_flag_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_catalog_flag_escalation();

CREATE OR REPLACE FUNCTION public.admin_map_franchise_owner(
  p_franchise_id UUID,
  p_new_owner_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_owner UUID;
  v_old_is_catalog BOOLEAN;
  v_new_is_catalog BOOLEAN;
  v_inquiries INTEGER := 0;
  v_conversations INTEGER := 0;
  v_moved INTEGER := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'You are not allowed to map franchise owners';
  END IF;

  IF p_franchise_id IS NULL OR p_new_owner_id IS NULL THEN
    RAISE EXCEPTION 'Franchise and owner are required';
  END IF;

  SELECT f.franchisor_id, COALESCE(p.is_catalog_account, FALSE)
  INTO v_old_owner, v_old_is_catalog
  FROM public.franchises f
  JOIN public.profiles p ON p.id = f.franchisor_id
  WHERE f.id = p_franchise_id
  FOR UPDATE OF f;

  IF v_old_owner IS NULL THEN
    RAISE EXCEPTION 'Franchise listing not found';
  END IF;

  IF NOT v_old_is_catalog THEN
    RAISE EXCEPTION 'Only franchises held by a catalog account can be mapped';
  END IF;

  IF p_new_owner_id = v_old_owner THEN
    RAISE EXCEPTION 'Choose a different owner';
  END IF;

  SELECT COALESCE(is_catalog_account, FALSE)
  INTO v_new_is_catalog
  FROM public.profiles
  WHERE id = p_new_owner_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Owner account not found';
  END IF;

  IF v_new_is_catalog THEN
    RAISE EXCEPTION 'The new owner cannot be a catalog account';
  END IF;

  UPDATE public.franchises
  SET franchisor_id = p_new_owner_id,
      updated_at = NOW()
  WHERE id = p_franchise_id;

  UPDATE public.inquiries
  SET recipient_id = p_new_owner_id
  WHERE listing_id = p_franchise_id
    AND COALESCE(listing_type, 'franchise') = 'franchise'
    AND recipient_id = v_old_owner;
  GET DIAGNOSTICS v_inquiries = ROW_COUNT;

  UPDATE public.conversations
  SET participant_1 = p_new_owner_id
  WHERE listing_id = p_franchise_id
    AND COALESCE(listing_type, 'franchise') = 'franchise'
    AND participant_1 = v_old_owner
    AND participant_2 IS DISTINCT FROM p_new_owner_id;
  GET DIAGNOSTICS v_moved = ROW_COUNT;
  v_conversations := v_conversations + v_moved;

  UPDATE public.conversations
  SET participant_2 = p_new_owner_id
  WHERE listing_id = p_franchise_id
    AND COALESCE(listing_type, 'franchise') = 'franchise'
    AND participant_2 = v_old_owner
    AND participant_1 IS DISTINCT FROM p_new_owner_id;
  GET DIAGNOSTICS v_moved = ROW_COUNT;
  v_conversations := v_conversations + v_moved;

  INSERT INTO public.activity_logs (
    profile_id,
    user_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  VALUES (
    auth.uid(),
    auth.uid(),
    'franchise_owner_mapped',
    'franchise',
    p_franchise_id,
    jsonb_build_object(
      'previous_owner_id', v_old_owner,
      'new_owner_id', p_new_owner_id,
      'inquiries_moved', v_inquiries,
      'conversations_moved', v_conversations
    )
  );

  RETURN jsonb_build_object(
    'franchise_id', p_franchise_id,
    'previous_owner_id', v_old_owner,
    'new_owner_id', p_new_owner_id,
    'inquiries_moved', v_inquiries,
    'conversations_moved', v_conversations
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_map_franchise_owner(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_map_franchise_owner(UUID, UUID) TO authenticated;

COMMENT ON FUNCTION public.admin_map_franchise_owner(UUID, UUID) IS
  'Admin-only: move a catalog-held franchise, its enquiries, and its conversations to a real owner';
