-- Update add_reward_credit to accept amount
DROP FUNCTION IF EXISTS add_reward_credit(UUID);

CREATE OR REPLACE FUNCTION add_reward_credit(user_id UUID, amount INT DEFAULT 1)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_credits INT;
BEGIN
  UPDATE public.profiles 
  SET credits = credits + amount 
  WHERE id = user_id
  RETURNING credits INTO new_credits;
  
  RETURN new_credits;
END;
$$;
