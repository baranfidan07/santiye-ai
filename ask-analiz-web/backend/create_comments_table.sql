-- Create comments table for confession jury system
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    confession_id UUID NOT NULL REFERENCES confessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    username VARCHAR(50) DEFAULT 'Anonim',
    text TEXT NOT NULL CHECK (char_length(text) > 0),
    is_toxic_vote BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Anyone can read comments
CREATE POLICY "comments_read_all" ON comments
    FOR SELECT USING (true);

-- Authenticated users can insert
CREATE POLICY "comments_insert_auth" ON comments
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Users can delete their own comments
CREATE POLICY "comments_delete_own" ON comments
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_comments_confession_id ON comments(confession_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
