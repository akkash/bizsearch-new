-- Inquiry recipient RLS + franchise application dedupe

-- Belt-and-suspenders: recipient must match listing owner (trigger 033 also enforces)
DROP POLICY IF EXISTS "Authenticated users can create inquiries" ON public.inquiries;

CREATE POLICY "Authenticated users can create inquiries"
ON public.inquiries FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND (
    (
      listing_type = 'franchise'
      AND recipient_id = (
        SELECT f.franchisor_id FROM public.franchises f WHERE f.id = listing_id
      )
    )
    OR (
      listing_type = 'business'
      AND recipient_id = (
        SELECT b.seller_id FROM public.businesses b WHERE b.id = listing_id
      )
    )
  )
);

-- Remove duplicate applications (keep earliest per user + franchise)
DELETE FROM public.franchise_applications a
USING public.franchise_applications b
WHERE a.user_id = b.user_id
  AND a.franchise_id = b.franchise_id
  AND a.created_at > b.created_at;

CREATE UNIQUE INDEX IF NOT EXISTS idx_franchise_applications_user_franchise
ON public.franchise_applications (user_id, franchise_id);

COMMENT ON INDEX public.idx_franchise_applications_user_franchise IS
  'One application per user per franchise — blocks double-submit duplicates';
