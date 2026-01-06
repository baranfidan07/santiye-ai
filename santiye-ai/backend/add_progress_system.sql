-- 1. MILESTONES (The Standard Template)
-- This table holds the "Master List" of tasks and their weights.
-- A company copies these into their own project tracker.

CREATE TABLE IF NOT EXISTS milestones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id), -- If NULL, it's a System Global Template
    phase_name TEXT NOT NULL, -- e.g., "Kaba Yapı"
    task_name TEXT NOT NULL,  -- e.g., "Temel Betonu"
    weight_points INTEGER NOT NULL DEFAULT 0, -- The "Importance" score (Total ~1000)
    display_order INTEGER DEFAULT 0
);

-- 2. PROJECT_PROGRESS (The Actual Tracking)
-- Tracks the status of each milestone for a specific company.

CREATE TABLE IF NOT EXISTS project_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    milestone_id UUID REFERENCES milestones(id),
    company_id UUID REFERENCES companies(id) NOT NULL,
    
    status TEXT DEFAULT 'pending', -- pending, waiting_approval, completed
    is_confirmed BOOLEAN DEFAULT FALSE, -- The "Anti-Hallucination" Check
    confirmed_by UUID REFERENCES auth.users(id), -- Who confirmed it? (Admin/Foreman)
    
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_progress ENABLE ROW LEVEL SECURITY;

-- Allow reading global templates (where company_id is NULL)
CREATE POLICY "Read Global & Own Milestones" ON milestones
FOR SELECT USING (company_id IS NULL OR company_id IN (
    SELECT company_id FROM profiles WHERE user_id = auth.uid() OR phone_number = current_setting('app.current_phone', true)
));

CREATE POLICY "Manage Own Milestones" ON milestones
FOR ALL USING (company_id IN (
    SELECT company_id FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
));

-- Progress Policies
CREATE POLICY "Read Own Progress" ON project_progress
FOR SELECT USING (company_id IN (
    SELECT company_id FROM profiles WHERE user_id = auth.uid() OR phone_number = current_setting('app.current_phone', true)
));

CREATE POLICY "Update Progress" ON project_progress
FOR UPDATE USING (company_id IN (
    SELECT company_id FROM profiles WHERE user_id = auth.uid() AND (role = 'admin' OR is_approved = true)
));
