from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from openai import OpenAI
import json
from supabase import create_client, Client

# Initialize FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Clients
client = OpenAI(
    api_key=os.environ.get("DEEPSEEK_API_KEY"),
    base_url="https://api.deepseek.com"
)

supabase: Client = create_client(
    os.environ.get("NEXT_PUBLIC_SUPABASE_URL", ""),
    os.environ.get("SUPABASE_SERVICE_KEY", "")
)

# Models
class Message(BaseModel):
    role: str
    content: str
    riskScore: Optional[float] = None

class ChatRequest(BaseModel):
    messages: List[Message]
    persona: str = 'dedektif'
    language: str = 'tr'
    mood: Optional[str] = None
    mode: str = 'mini'
    system_prompt: Optional[str] = None
    # SaaS Fields
    user_id: Optional[str] = None # For web users to look up profile

# --- SAAS HELPERS ---
async def get_profile_by_phone(phone: str):
    res = supabase.table("profiles").select("*").eq("phone_number", phone).execute()
    return res.data[0] if res.data else None

async def get_company_by_code(code: str):
    res = supabase.table("companies").select("*").eq("code", code).execute()
    return res.data[0] if res.data else None

async def create_profile(phone: str, company_id: str):
    data = {"phone_number": phone, "company_id": company_id, "role": "worker"}
    return supabase.table("profiles").insert(data).execute()

# --- CORE AI LOGIC (SHARED BRAIN) ---
async def fetch_site_memory(company_id: str):
    """Fetches recent site facts for the specific company."""
    if not company_id:
        return "Şirket kaydı bulunamadı. Hafıza kapalı."
    
    try:
        response = supabase.table("site_memory")\
            .select("content, created_at, category")\
            .eq("company_id", company_id)\
            .order("created_at", desc=True).limit(15).execute()
        
        if response.data:
            return "\n".join([f"- [{m['created_at'][:16]}] {m['content']}" for m in response.data])
        return "Henüz bir kayıt yok."
    except Exception as e:
        print(f"Memory Fetch Error: {e}")
        return "Hafıza alınamadı."

async def save_site_memory(content: str, company_id: str, category: str = "general"):
    """Saves a new fact to the hivemind for the specific company."""
    if not company_id:
        return
    try:
        supabase.table("site_memory").insert({
            "content": content,
            "category": category,
            "company_id": company_id
        }).execute()
    except Exception as e:
        print(f"Memory Save Error: {e}")

async def process_chat_message(messages: List[dict], company_id: Optional[str], system_prompt: Optional[str] = None):
    try:
        # 1. Fetch Hivemind Context (Isolating by Company)
        site_memory_context = await fetch_site_memory(company_id)
        
        # 2. Prepare System Prompt
        base_system_prompt = system_prompt or """### ROLE & PERSONA
You are the SITE CHIEF (Şantiye Şefi). Your name is "Dayı".
You speak Turkish. You are experienced, fatherly, strictly professional but warm.
You manage a construction site.

### HIVEMIND (SITE MEMORY - CONFIDENTIAL)
Here is the current status of THIS site:
{MEMORY_CONTEXT}

### INSTRUCTIONS
1. Analyze the user's input.
2. If the user is REPORTING a new fact (e.g., "Cement finished"), EXTRACT it to 'memory_update'.
3. If the user is ASKING a question, use the HIVEMIND to answer.
4. Give valid, safe, and direct advice.

### OUTPUT FORMAT (JSON)
{
  "insight": "Your direct answer to the user.",
  "risk_score": 0-100,
  "memory_update": "Extracted new fact or null"
}
"""
        final_system_prompt = base_system_prompt.replace("{MEMORY_CONTEXT}", site_memory_context)

        api_messages = [{"role": "system", "content": final_system_prompt}]
        for msg in messages:
             api_messages.append({"role": msg.role, "content": msg.content})

        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=api_messages,
            temperature=0.4,
            response_format={'type': 'json_object'}
        )
        
        content = response.choices[0].message.content
        result = json.loads(content)
        
        # 3. Save New Memory if detected
        if result.get("memory_update") and company_id:
            print(f"New Memory Detected for {company_id}: {result['memory_update']}")
            await save_site_memory(result['memory_update'], company_id)

        return result

    except Exception as e:
        print(f"AI Process Error: {str(e)}")
        return {"insight": "Hat çekmiyor yeğenim. Tekrar et.", "risk_score": 0}

@app.get("/")
def read_root():
    return {"status": "Santiye AI Backend Running (SaaS Mode)"}

@app.post("/analyze")
async def analyze_sentiment(request: ChatRequest):
    # Web Logic: For now, assuming a 'DEMO' company or checking user profile
    # Simplified: If user_id provided, look up profile. If not, use Demo Context.
    
    company_id = None
    if request.user_id:
        # Look up profile
        res = supabase.table("profiles").select("company_id").eq("user_id", request.user_id).execute()
        if res.data:
            company_id = res.data[0]['company_id']
    
    # Fallback to a 'DEMO' logic or just run without memory if no company
    # But for 'Hivemind' to work we need a company.
    # We'll allow running without company_id (Memory will be "Closed")
    
    msgs = [{"role": m.role, "content": m.content} for m in request.messages]
    return await process_chat_message(msgs, company_id, request.system_prompt)


# --- WHATSAPP WEBHOOK (SAAS ONBOARDING) ---
@app.get("/whatsapp")
async def verify_whatsapp(request: Request):
    """
    Meta Webhook Verification Challenge.
    """
    token = os.environ.get("WHATSAPP_VERIFY_TOKEN", "santiye_secret")
    
    mode = request.query_params.get("hub.mode")
    verify_token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")
    
    if mode and verify_token:
        if mode == "subscribe" and verify_token == token:
            print("WEBHOOK_VERIFIED")
            return int(challenge)
        else:
            raise HTTPException(status_code=403, detail="Verification failed")
    
    return {"status": "Hello WhatsApp"}

import requests

# ... helpers ...

async def send_whatsapp_message(to_number: str, message: str):
    phone_id = os.environ.get("WHATSAPP_PHONE_ID")
    token = os.environ.get("WHATSAPP_API_TOKEN")
    
    if not phone_id or not token:
        print("WhatsApp Credentials missing")
        return

    url = f"https://graph.facebook.com/v17.0/{phone_id}/messages"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    data = {
        "messaging_product": "whatsapp",
        "to": to_number,
        "type": "text",
        "text": {"body": message}
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        
        # Log Response
        with open("webhook_debug.log", "a", encoding="utf-8") as f:
            f.write(f"Send Status: {response.status_code}\n")
            f.write(f"Send Response: {response.text}\n")
            
        if response.status_code != 200:
            print(f"Failed to send message: {response.text}")
    except Exception as e:
        with open("webhook_debug.log", "a", encoding="utf-8") as f:
            f.write(f"Send ErrorException: {e}\n")
        print(f"Error sending WhatsApp: {e}")

# ... webhook ...

@app.post("/whatsapp")
async def whatsapp_webhook(request: dict):
    with open("webhook_debug.log", "a", encoding="utf-8") as f:
        f.write(f"\n--- NEW REQUEST ---\n{json.dumps(request, indent=2)}\n")
    
    try:
        # Check if it's a Message (not a status update)
        entry = request.get("entry", [])[0]
        changes = entry.get("changes", [])[0]
        value = changes.get("value", {})
        
        if "messages" not in value:
            return {"status": "ignored"}

        message_data = value.get("messages", [])[0]
        phone_number = message_data.get("from")
        text_body = message_data.get("text", {}).get("body", "").strip()
        
        with open("webhook_debug.log", "a", encoding="utf-8") as f:
            f.write(f"Processing: From={phone_number}, Text={text_body}\n")

        # 1. Check Profile
        profile = await get_profile_by_phone(phone_number)
        reply_text = ""
        
        if not profile:
            with open("webhook_debug.log", "a", encoding="utf-8") as f:
                 f.write("User not found. Checking code.\n")
            
            if text_body.startswith("#"):
                code = text_body
                company = await get_company_by_code(code)
                if company:
                    await create_profile(phone_number, company['id'])
                    reply_text = f"Hoş geldin usta! {company['name']} için kaydın alındı. Şantiye Şefin ONAYLAYINCA girişin açılacak."
                else:
                    reply_text = "Hatalı şirket kodu yeğenim. Tekrar dene."
                    with open("webhook_debug.log", "a", encoding="utf-8") as f:
                        f.write(f"Invalid code: {code}\n")
            else:
                reply_text = "Selam yeğenim. Hangi şantiyedensin? Şirket kodunu yaz (Örn: #ABC)."
        
        elif not profile.get('is_approved', False):
             reply_text = "Henüz onay almadın usta. Şefe bi görün istersen."
        
        else:
            company_id = profile['company_id']
            result = await process_chat_message([{"role": "user", "content": text_body}], company_id)
            reply_text = result['insight']

        # Send Reply
        if reply_text:
            with open("webhook_debug.log", "a", encoding="utf-8") as f:
                 f.write(f"Sending Reply: {reply_text}\n")
            await send_whatsapp_message(phone_number, reply_text)

        return {"status": "processed"}
        
    except Exception as e:
        with open("webhook_debug.log", "a", encoding="utf-8") as f:
             f.write(f"CRITICAL ERROR: {e}\n")
        print(f"WhatsApp Error: {e}")
        return {"status": "error"}


@app.post("/generate-report")
async def generate_confession(request: ChatRequest):
    # Old logic... kept for simplicity
    return {"report_text": "SaaS Raporu Hazır."}
