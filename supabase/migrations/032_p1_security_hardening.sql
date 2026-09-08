-- P1 Security: close open notification INSERT; restrict direct client inserts

DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Notifications are created only via SECURITY DEFINER functions and triggers.
-- No INSERT policy for anon/authenticated = direct REST inserts denied.

REVOKE INSERT ON public.notifications FROM anon, authenticated;

COMMENT ON TABLE public.notifications IS 'Inserts allowed only via create_notification() and triggers (SECURITY DEFINER)';
