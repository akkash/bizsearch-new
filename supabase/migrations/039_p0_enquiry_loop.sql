-- P0: enquiry notifications, in-platform conversation, listing review alerts, listing media bucket.

ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_inquiries_conversation_id
  ON public.inquiries(conversation_id);

CREATE INDEX IF NOT EXISTS idx_conversations_listing
  ON public.conversations(listing_id, listing_type);

INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-media', 'listing-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Listing media is publicly readable" ON storage.objects;
CREATE POLICY "Listing media is publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-media');

DROP POLICY IF EXISTS "Users can upload listing media" ON storage.objects;
CREATE POLICY "Users can upload listing media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'listing-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can update own listing media" ON storage.objects;
CREATE POLICY "Users can update own listing media"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'listing-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete own listing media" ON storage.objects;
CREATE POLICY "Users can delete own listing media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'listing-media'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE OR REPLACE FUNCTION public.notify_on_inquiry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  listing_name TEXT;
  conversation_uuid UUID;
  recipient_url TEXT;
  sender_url TEXT;
BEGIN
  IF NEW.listing_type = 'business' THEN
    SELECT name INTO listing_name FROM public.businesses WHERE id = NEW.listing_id;
    recipient_url := '/pipeline';
  ELSE
    SELECT brand_name INTO listing_name FROM public.franchises WHERE id = NEW.listing_id;
    recipient_url := '/pipeline';
  END IF;

  sender_url := '/my-enquiries?inquiry=' || NEW.id::text;

  PERFORM public.create_notification(
    NEW.recipient_id,
    'new_inquiry',
    'New enquiry received',
    'You have a new enquiry about ' || COALESCE(listing_name, 'your listing'),
    recipient_url,
    jsonb_build_object(
      'inquiry_id', NEW.id,
      'listing_type', NEW.listing_type,
      'listing_id', NEW.listing_id
    )
  );

  IF NEW.sender_id IS NOT NULL THEN
    PERFORM public.create_notification(
      NEW.sender_id,
      'inquiry',
      'Enquiry sent',
      'Your enquiry about ' || COALESCE(listing_name, 'this listing') || ' was sent. The brand has not received your phone number yet.',
      sender_url,
      jsonb_build_object(
        'inquiry_id', NEW.id,
        'listing_type', NEW.listing_type,
        'listing_id', NEW.listing_id
      )
    );
  END IF;

  SELECT id INTO conversation_uuid
  FROM public.conversations
  WHERE listing_id = NEW.listing_id
    AND COALESCE(listing_type, '') = COALESCE(NEW.listing_type, '')
    AND (
      (participant_1 = NEW.sender_id AND participant_2 = NEW.recipient_id)
      OR (participant_1 = NEW.recipient_id AND participant_2 = NEW.sender_id)
    )
  ORDER BY created_at DESC
  LIMIT 1;

  IF conversation_uuid IS NULL AND NEW.sender_id IS NOT NULL THEN
    INSERT INTO public.conversations (
      participant_1,
      participant_2,
      listing_id,
      listing_type,
      last_message,
      last_message_at
    )
    VALUES (
      NEW.sender_id,
      NEW.recipient_id,
      NEW.listing_id,
      NEW.listing_type,
      left(NEW.message, 500),
      NOW()
    )
    RETURNING id INTO conversation_uuid;
  END IF;

  IF conversation_uuid IS NOT NULL AND NEW.sender_id IS NOT NULL THEN
    INSERT INTO public.messages (conversation_id, sender_id, content)
    VALUES (conversation_uuid, NEW.sender_id, NEW.message);

    UPDATE public.conversations
    SET last_message = left(NEW.message, 500),
        last_message_at = NOW()
    WHERE id = conversation_uuid;

    UPDATE public.inquiries
    SET conversation_id = conversation_uuid
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_inquiry_created ON public.inquiries;
CREATE TRIGGER on_inquiry_created
AFTER INSERT ON public.inquiries
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_inquiry();

CREATE OR REPLACE FUNCTION public.notify_on_listing_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  owner_id UUID;
  listing_name TEXT;
  listing_kind TEXT;
BEGIN
  IF TG_TABLE_NAME = 'franchises' THEN
    owner_id := NEW.franchisor_id;
    listing_name := NEW.brand_name;
    listing_kind := 'franchise';
  ELSE
    owner_id := NEW.seller_id;
    listing_name := NEW.name;
    listing_kind := 'business';
  END IF;

  IF owner_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status = 'active' THEN
    PERFORM public.create_notification(
      owner_id,
      'listing_approved',
      'Listing approved',
      COALESCE(listing_name, 'Your listing') || ' is now live on BizSearch.',
      '/my-listings',
      jsonb_build_object('listing_id', NEW.id, 'listing_type', listing_kind)
    );
  ELSIF NEW.status IS DISTINCT FROM OLD.status AND NEW.status = 'rejected' THEN
    PERFORM public.create_notification(
      owner_id,
      'listing_rejected',
      'Listing needs changes',
      COALESCE(listing_name, 'Your listing') || ' was not approved. Open My Listings to review the status.',
      '/my-listings',
      jsonb_build_object(
        'listing_id', NEW.id,
        'listing_type', listing_kind,
        'reason', COALESCE(NEW.rejection_reason, '')
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_franchise_review_status ON public.franchises;
CREATE TRIGGER on_franchise_review_status
AFTER UPDATE OF status ON public.franchises
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_listing_review();

DROP TRIGGER IF EXISTS on_business_review_status ON public.businesses;
CREATE TRIGGER on_business_review_status
AFTER UPDATE OF status ON public.businesses
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_listing_review();

GRANT EXECUTE ON FUNCTION public.create_notification(UUID, notification_type, TEXT, TEXT, TEXT, JSONB) TO authenticated;
