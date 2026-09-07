-- Phase 1: Franchise lead pipeline statuses and inquiry RLS hardening

-- Expand inquiry status values for franchisor CRM
ALTER TABLE public.inquiries DROP CONSTRAINT IF EXISTS inquiries_status_check;

UPDATE public.inquiries SET status = 'contacted' WHERE status IN ('read', 'replied');
UPDATE public.inquiries SET status = 'lost' WHERE status = 'closed';

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
    'converted',
    'lost'
  ));

-- Allow nullable sender for legacy rows; new app flow requires authenticated sender
ALTER TABLE public.inquiries ALTER COLUMN sender_id DROP NOT NULL;

-- Franchisors can view inquiries on franchises they own (listing-based access)
DROP POLICY IF EXISTS "Franchisors can view franchise listing inquiries" ON public.inquiries;
CREATE POLICY "Franchisors can view franchise listing inquiries"
ON public.inquiries FOR SELECT
USING (
  listing_type = 'franchise'
  AND EXISTS (
    SELECT 1 FROM public.franchises f
    WHERE f.id = inquiries.listing_id
      AND f.franchisor_id = auth.uid()
  )
);

-- Sellers can view inquiries on businesses they own
DROP POLICY IF EXISTS "Sellers can view business listing inquiries" ON public.inquiries;
CREATE POLICY "Sellers can view business listing inquiries"
ON public.inquiries FOR SELECT
USING (
  listing_type = 'business'
  AND EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = inquiries.listing_id
      AND b.seller_id = auth.uid()
  )
);

-- Replace restrictive insert policy when present
DROP POLICY IF EXISTS "Users can send inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Anyone can create inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Authenticated users can create inquiries" ON public.inquiries;

CREATE POLICY "Authenticated users can create inquiries"
ON public.inquiries FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

-- Recipients and listing owners can update inquiry status/notes
DROP POLICY IF EXISTS "Recipients can update inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Recipients can update inquiry status" ON public.inquiries;

CREATE POLICY "Recipients can update inquiries"
ON public.inquiries FOR UPDATE
USING (
  auth.uid() = recipient_id
  OR (
    listing_type = 'franchise'
    AND EXISTS (
      SELECT 1 FROM public.franchises f
      WHERE f.id = inquiries.listing_id AND f.franchisor_id = auth.uid()
    )
  )
  OR (
    listing_type = 'business'
    AND EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = inquiries.listing_id AND b.seller_id = auth.uid()
    )
  )
);
