-- Nuke all Reddit/Imported Confessions
-- Run this in your Supabase Dashboard > SQL Editor to clean the database.

DELETE FROM confessions 
WHERE reddit_id IS NOT NULL 
   OR source_url IS NOT NULL
   OR content LIKE '%Mert%'; -- Safety net for the localized ones if columns were missed

-- Verify cleanup
SELECT count(*) as remaining_imports FROM confessions WHERE reddit_id IS NOT NULL;
