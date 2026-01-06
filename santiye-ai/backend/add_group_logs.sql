-- Table to store RAW group chat logs (Audit Trail)
-- This ensures "nothing is forgotten" as per user requirement.

CREATE TABLE IF NOT EXISTS group_chat_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    group_id TEXT NOT NULL,          -- WhatsApp Group ID (e.g., 12036...)
    company_id UUID REFERENCES companies(id), -- Linked company
    sender_phone TEXT NOT NULL,      -- Who sent it
    sender_name TEXT,                -- Display name (if available)
    message_type TEXT DEFAULT 'text', -- text, image, audio, etc.
    content TEXT,                    -- The actual message
    media_url TEXT,                  -- Link to image/audio if applicable
    raw_payload JSONB,               -- Full Meta payload for debugging
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast retrieval by group or company
CREATE INDEX idx_group_logs_company ON group_chat_logs(company_id);
CREATE INDEX idx_group_logs_group_id ON group_chat_logs(group_id);

-- Add 'is_group_admin' to profiles to distinguish foreman from worker in groups
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_group_admin BOOLEAN DEFAULT FALSE;
