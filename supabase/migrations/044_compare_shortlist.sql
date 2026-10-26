-- Persist signed-in franchise compare shortlist (max 3 listing ids).

ALTER TABLE public.franchisee_details
  ADD COLUMN IF NOT EXISTS compare_listing_ids UUID[] DEFAULT '{}';

COMMENT ON COLUMN public.franchisee_details.compare_listing_ids IS
  'Ordered franchise listing ids in the seeker compare workspace (max 3)';
