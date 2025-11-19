-- Create notification types
CREATE TYPE notification_type AS ENUM (
  'inquiry',
  'message',
  'listing_approved',
  'listing_rejected',
  'verification_approved',
  'verification_rejected',
  'saved_listing_update',
  'new_inquiry',
  'inquiry_response',
  'system'
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read) WHERE read = FALSE;
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, read);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

-- System can insert notifications
CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, action_url, metadata)
  VALUES (p_user_id, p_type, p_title, p_message, p_action_url, p_metadata)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.notifications
  SET read = TRUE, read_at = NOW()
  WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.notifications
  SET read = TRUE, read_at = NOW()
  WHERE user_id = p_user_id AND user_id = auth.uid() AND read = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create notification when inquiry is created
CREATE OR REPLACE FUNCTION notify_on_inquiry()
RETURNS TRIGGER AS $$
DECLARE
  recipient_profile public.profiles%ROWTYPE;
  listing_name TEXT;
BEGIN
  -- Get recipient profile
  SELECT * INTO recipient_profile FROM public.profiles WHERE id = NEW.recipient_id;
  
  -- Get listing name
  IF NEW.listing_type = 'business' THEN
    SELECT name INTO listing_name FROM public.businesses WHERE id = NEW.listing_id;
  ELSE
    SELECT brand_name INTO listing_name FROM public.franchises WHERE id = NEW.listing_id;
  END IF;
  
  -- Create notification for recipient
  PERFORM create_notification(
    NEW.recipient_id,
    'new_inquiry',
    'New Inquiry Received',
    'You have received a new inquiry about ' || COALESCE(listing_name, 'your listing'),
    '/inquiries',
    jsonb_build_object(
      'inquiry_id', NEW.id,
      'listing_type', NEW.listing_type,
      'listing_id', NEW.listing_id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_inquiry_created
AFTER INSERT ON public.inquiries
FOR EACH ROW
EXECUTE FUNCTION notify_on_inquiry();
