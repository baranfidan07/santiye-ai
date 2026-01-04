from dotenv import load_dotenv
load_dotenv()

import os
from supabase import create_client, Client

url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_KEY")

if not url or not key:
    print("Error: Missing env vars")
    exit(1)

print(f"Connecting to: {url}")
supabase: Client = create_client(url, key)

try:
    # 1. Try to INSERT a test memory
    print("Attempting to insert test memory...")
    data = {"content": "Santiye AI bağlantı testi başarılı.", "category": "system_check"}
    res = supabase.table("site_memory").insert(data).execute()
    print("Insert Success!")

    # 2. Try to READ it back
    print("Attempting to read memory...")
    response = supabase.table("site_memory").select("*").limit(1).execute()
    print(f"Read Success! Found {len(response.data)} items.")
    print(response.data)

except Exception as e:
    print(f"\n❌ ERROR: {e}")
    print("Muhtemelen tablo yok veya RLS politikaları eksik.")
