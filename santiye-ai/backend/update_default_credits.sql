-- Update default credits for NEW users to 5
ALTER TABLE public.profiles ALTER COLUMN credits SET DEFAULT 5;

-- Optional: Bump existing users who have less than 5 up to 5 (One-time stimulus)
UPDATE public.profiles 
SET credits = 5 
WHERE credits < 5;
