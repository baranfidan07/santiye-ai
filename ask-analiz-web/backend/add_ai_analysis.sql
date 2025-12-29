-- Add ai_analysis column to confessions table for caching OpenAI results
ALTER TABLE public.confessions 
ADD COLUMN IF NOT EXISTS ai_analysis text DEFAULT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_confessions_ai_analysis 
ON public.confessions(id) 
WHERE ai_analysis IS NOT NULL;
