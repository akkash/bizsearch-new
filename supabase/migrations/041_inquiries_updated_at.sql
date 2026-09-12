-- Live inquiries was created from 002 without updated_at. 014's
-- CREATE TABLE IF NOT EXISTS never added the column, but the BEFORE UPDATE
-- trigger still assigns NEW.updated_at. P0's notify_on_inquiry updates
-- conversation_id on insert, which fires that trigger and aborts the enquiry.

ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE OR REPLACE FUNCTION public.update_inquiry_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 014 inserted notifications directly. 032 revoked INSERT, so enquiry
-- creation failed with "permission denied for table notifications".
DROP TRIGGER IF EXISTS trigger_notify_new_inquiry ON public.inquiries;
