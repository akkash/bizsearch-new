-- Inquiry pipeline hardening: enforce listing owner as recipient, dedupe active enquiries

-- Always set recipient_id from listing owner (ignores client spoofing)
CREATE OR REPLACE FUNCTION public.enforce_inquiry_recipient()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_id UUID;
BEGIN
  IF NEW.listing_type = 'franchise' THEN
    SELECT f.franchisor_id INTO owner_id
    FROM public.franchises f
    WHERE f.id = NEW.listing_id;
  ELSIF NEW.listing_type = 'business' THEN
    SELECT b.seller_id INTO owner_id
    FROM public.businesses b
    WHERE b.id = NEW.listing_id;
  ELSE
    RAISE EXCEPTION 'Invalid listing_type: %', NEW.listing_type;
  END IF;

  IF owner_id IS NULL THEN
    RAISE EXCEPTION 'Listing not found for inquiry';
  END IF;

  NEW.recipient_id := owner_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_inquiry_recipient ON public.inquiries;
CREATE TRIGGER enforce_inquiry_recipient
BEFORE INSERT ON public.inquiries
FOR EACH ROW
EXECUTE FUNCTION public.enforce_inquiry_recipient();

-- One open enquiry per sender per listing (blocks double-submit duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS idx_inquiries_one_active_per_sender_listing
ON public.inquiries (sender_id, listing_id, listing_type)
WHERE status = 'new';

COMMENT ON FUNCTION public.enforce_inquiry_recipient() IS
  'Sets recipient_id from franchise franchisor_id or business seller_id; blocks spoofed recipient_id';
