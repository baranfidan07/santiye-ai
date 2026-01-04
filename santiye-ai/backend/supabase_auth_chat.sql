-- DROP TABLES TO ENSURE CLEAN SLATE (Fixes "column missing" errors)
drop table if exists public.messages;
drop table if exists public.chat_sessions;

-- Create profiles table if not exists (Keep profiles if they exist)
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Drop existing policies to avoid duplicates
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
drop policy if exists "Users can insert their own profile." on public.profiles;
drop policy if exists "Users can update own profile." on public.profiles;

create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- Create Chat Sessions Table (Re-create)
create table public.chat_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text default 'Yeni Analiz',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Sessions
alter table public.chat_sessions enable row level security;

create policy "Users can view own sessions."
  on public.chat_sessions for select
  using ( auth.uid() = user_id );

create policy "Users can insert own sessions."
  on public.chat_sessions for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own sessions."
  on public.chat_sessions for update
  using ( auth.uid() = user_id );

create policy "Users can delete own sessions."
  on public.chat_sessions for delete
  using ( auth.uid() = user_id );

-- Create Messages Table (Re-create)
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references public.chat_sessions(id) on delete cascade not null,
  role text check (role in ('user', 'ai')) not null,
  content text not null,
  risk_score int,
  confidence int,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Messages
alter table public.messages enable row level security;

-- Policy: Users can see messages if they own the session
create policy "Users can view messages of own sessions."
  on public.messages for select
  using (
    exists (
      select 1 from public.chat_sessions
      where chat_sessions.id = messages.session_id
      and chat_sessions.user_id = auth.uid()
    )
  );

create policy "Users can insert messages to own sessions."
  on public.messages for insert
  with check (
    exists (
      select 1 from public.chat_sessions
      where chat_sessions.id = session_id
      and chat_sessions.user_id = auth.uid()
    )
  );

-- Trigger to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger first to avoid error
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
