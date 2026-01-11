-- Table for Direct Messages (History)
CREATE TABLE IF NOT EXISTS dm_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone_number TEXT NOT NULL,
    company_id UUID REFERENCES companies(id),
    role TEXT NOT NULL DEFAULT 'user', -- 'user' or 'assistant'
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_dm_logs_phone ON dm_logs(phone_number);
