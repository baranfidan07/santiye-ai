-- Add like_count column to confessions table
ALTER TABLE public.confessions 
ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0;

-- Create increment_like RPC function
CREATE OR REPLACE FUNCTION increment_like(confession_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE public.confessions 
    SET like_count = COALESCE(like_count, 0) + 1
    WHERE id = confession_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create decrement_like RPC function
CREATE OR REPLACE FUNCTION decrement_like(confession_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE public.confessions 
    SET like_count = GREATEST(0, COALESCE(like_count, 0) - 1)
    WHERE id = confession_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions for anonymous users
GRANT EXECUTE ON FUNCTION increment_like(uuid) TO anon;
GRANT EXECUTE ON FUNCTION decrement_like(uuid) TO anon;
GRANT EXECUTE ON FUNCTION increment_like(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_like(uuid) TO authenticated;
