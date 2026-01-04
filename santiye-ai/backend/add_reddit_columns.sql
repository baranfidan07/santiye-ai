-- Add source_url column to confessions table if it doesn't exist
-- This is needed to track Reddit posts and prevent duplicates
ALTER TABLE confessions ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE confessions ADD COLUMN IF NOT EXISTS reddit_id TEXT;
