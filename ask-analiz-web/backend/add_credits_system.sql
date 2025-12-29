-- 1. Add credits column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credits INT DEFAULT 3;

-- 2. Function to deduct credits (Atomic)
CREATE OR REPLACE FUNCTION deduct_creditsForAnalysis(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_credits INT;
BEGIN
  -- Get current credits
  SELECT credits INTO current_credits FROM public.profiles WHERE id = user_id;
  
  -- Check if enough credits
  IF current_credits > 0 THEN
    UPDATE public.profiles SET credits = credits - 1 WHERE id = user_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;

-- 3. Function to add credits (Reward)
CREATE OR REPLACE FUNCTION add_reward_credit(user_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_credits INT;
BEGIN
  UPDATE public.profiles 
  SET credits = credits + 1 
  WHERE id = user_id
  RETURNING credits INTO new_credits;
  
  RETURN new_credits;
END;
$$;
