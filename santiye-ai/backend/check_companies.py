from dotenv import load_dotenv
load_dotenv()
import os
from supabase import create_client

supabase = create_client(
    os.environ.get("NEXT_PUBLIC_SUPABASE_URL"),
    os.environ.get("SUPABASE_SERVICE_KEY")
)

try:
    res = supabase.table("companies").select("*").execute()
    print("--- COMPANIES ---")
    for c in res.data:
        print(f"Name: {c['name']}, Code: {c['code']}")
except Exception as e:
    print(e)
