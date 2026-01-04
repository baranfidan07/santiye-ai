-- Create a simple table to store site facts/memories
create table if not exists site_memory (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  category text default 'general', -- material, safety, progress, issue
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id), -- optional, linking to user who reported it
  importance_score int default 1 -- 1: minor, 5: critical (AI can assign)
);

-- Enable RLS but allow open access for this MVP (since we are all on one site)
alter table site_memory enable row level security;

create policy "Enable read access for all users"
on site_memory for select
using (true);

create policy "Enable insert access for all users"
on site_memory for insert
with check (true);
