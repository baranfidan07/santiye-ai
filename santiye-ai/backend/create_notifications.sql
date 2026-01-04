-- 1. Create Notifications Table
CREATE TABLE public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('vote', 'system', 'reward')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  related_id uuid, -- e.g. confession_id
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. RLS Policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (mark as read)"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- 3. Trigger Function: Notify on Vote (Every 5th vote? Or every vote? Let's do every vote for now to test, but maybe throttle later)
-- Actually, notifying on EVERY vote is spammy. Let's notify on milestone (e.g. 1st, 5th, 10th vote)
-- Or simpler: Just simple notification for now "Someone voted on your confession"

CREATE OR REPLACE FUNCTION public.handle_new_vote()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  confession_owner_id uuid;
  confession_content text;
BEGIN
  -- Get confession owner
  SELECT user_id, content INTO confession_owner_id, confession_content
  FROM public.confessions
  WHERE id = NEW.confession_id;

  -- Don't notify if user voted on their own confession (if allowed)
  IF confession_owner_id = auth.uid() THEN
    RETURN NEW;
  END IF;

  -- SPAM PREVENTION: If there is already an UNREAD notification for this confession, don't spam another one.
  -- The user will see the aggregate result when they click the existing notification.
  IF EXISTS (
    SELECT 1 FROM public.notifications 
    WHERE user_id = confession_owner_id 
    AND type = 'vote' 
    AND related_id = NEW.confession_id 
    AND is_read = false
  ) THEN
    RETURN NEW;
  END IF;

  -- Insert Notification
  INSERT INTO public.notifications (user_id, type, title, message, related_id)
  VALUES (
    confession_owner_id,
    'vote',
    'İtirafına Yeni Oy Geldi!',
    LEFT(confession_content, 30) || '... hakkında biri oy kullandı.',
    NEW.confession_id
  );

  RETURN NEW;
END;
$$;

-- 4. Trigger
DROP TRIGGER IF EXISTS on_vote_created ON public.votes;
CREATE TRIGGER on_vote_created
  AFTER INSERT ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_vote();
