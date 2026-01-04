-- Add vote_type column to confessions table
-- This allows dynamic voting options based on content type

ALTER TABLE confessions 
ADD COLUMN IF NOT EXISTS vote_type TEXT DEFAULT 'toxic_or_valid';

-- Update existing confessions to use default vote type
UPDATE confessions 
SET vote_type = 'toxic_or_valid' 
WHERE vote_type IS NULL;
