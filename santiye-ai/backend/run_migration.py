from dotenv import load_dotenv
load_dotenv()

import os
from supabase import create_client, Client

# Load env vars manually or assume set
url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")

if not url or not key:
    print("Error: Missing env vars")
    exit(1)

supabase: Client = create_client(url, key)

sql = """
create table if not exists site_memory (
  id uuid default gen_random_uuid() primary key,
  content text not null,
  category text default 'general',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id)
);
"""

# Supabase-py doesn't support raw SQL easily unless via RPC or just using postgrest if allowed.
# Actually, the python client is just a wrapper for REST.
# We can't run DDL (Create Table) via the REST API unless we have a specific RPC function setup for it.
# BUT, we can try to use the `site_memory` table and failure implies it doesn't exist.
# The user might need to run the SQL in their Supabase Dashboard.

print("Please run the SQL in 'add_site_memory.sql' in your Supabase SQL Editor.")
print("The backend code is ready to use it once created.")
