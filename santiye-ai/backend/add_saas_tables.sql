-- 1. COMPANIES Table
create table if not exists companies (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  subscription_tier text default 'free', -- free, pro, enterprise
  code text unique not null, -- e.g. "SANTIYE_001"
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PROFILES Table (Links User/Phone to Company)
create table if not exists profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id), -- For Web Users (Optional for WhatsApp users)
  phone_number text unique, -- For WhatsApp Users taking priority
  company_id uuid references companies(id),
  role text default 'worker', -- worker, admin
  is_approved boolean default false, -- Approval Queue
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. UPDATE MEMORY Table (Add Isolation)
alter table site_memory 
add column if not exists company_id uuid references companies(id);

-- 4. RLS POLICIES (Data Isolation)
alter table companies enable row level security;
alter table profiles enable row level security;

-- Policy: Users can only see their own company's memory
drop policy if exists "Read All" on site_memory;
create policy "Isolate Memory" on site_memory
for select using (
  company_id in (
    select company_id from profiles 
    where profiles.user_id = auth.uid() 
    or profiles.phone_number = current_setting('app.current_phone', true) -- For future proofing
  )
);
