-- Enable Row Level Security
alter table if exists public.confessions enable row level security;
alter table if exists public.votes enable row level security;

-- Create Confessions Table
create table public.confessions (
  id uuid default gen_random_uuid() primary key,
  content text not null check (char_length(content) > 10),
  category text default 'General',
  toxic_score int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Votes Table (to prevent infinite spamming ideally, but simple for MVP)
create table public.votes (
  id uuid default gen_random_uuid() primary key,
  confession_id uuid references public.confessions(id) on delete cascade not null,
  vote_type text check (vote_type in ('up', 'down')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies for Confessions
create policy "Public confessions are viewable by everyone."
  on public.confessions for select
  using ( true );

create policy "Anyone can insert a confession."
  on public.confessions for insert
  with check ( true );

-- RLS Policies for Votes
create policy "Public votes are viewable by everyone."
  on public.votes for select
  using ( true );

create policy "Anyone can vote."
  on public.votes for insert
  with check ( true );

-- Optional: Function to update toxic_score automatically
-- (For MVP, we might just update the row directly from client if policy allows, 
-- but a trigger or RPC is safer. Let's start with client-side update for simplicity if RLS allows update)

create policy "Anyone can update toxic_score"
  on public.confessions for update
  using ( true );
