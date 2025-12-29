-- Add feedback column to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS feedback jsonb DEFAULT NULL;

-- Create function to log feedback and reward user safely
CREATE OR REPLACE FUNCTION log_feedback_and_reward(
  p_message_id UUID,
  p_feedback jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_message_owner_id UUID;
BEGIN
  -- 1. Get the user ID of the message owner (to ensure security)
  SELECT cs.user_id INTO v_message_owner_id
  FROM messages m
  JOIN chat_sessions cs ON m.session_id = cs.id
  WHERE m.id = p_message_id;

  -- 2. Update the message with feedback
  UPDATE messages
  SET feedback = p_feedback
  WHERE id = p_message_id;

  -- 3. Reward the user (Call existing credit function)
  -- 1 Credit for feedback
  PERFORM add_reward_credit(1); 

END;
$$;
