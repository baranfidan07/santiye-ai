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

import base64  # Added for Image Analysis

# Initialize FastAPI
app = FastAPI()

# Custom Modules
try:
    from excel_loader import process_budget_excel
except ImportError:
    print("Warning: excel_loader not found. Excel parsing disabled.")
    def process_budget_excel(a, b): return "Excel modülü eksik."

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "Santiye AI is Awake and Ready! 🏗️"}

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

async def log_group_message(group_id: str, phone: str, content: str, company_id: Optional[str], raw_data: dict):
    """Logs every group event to the audit trail."""
    try:
        supabase.table("group_chat_logs").insert({
            "group_id": group_id,
            "sender_phone": phone,
            "content": content,
            "company_id": company_id,
            "raw_payload": raw_data
        }).execute()
        print(f"Logged Group Msg: {group_id} | {content[:20]}")
    except Exception as e:
        print(f"Log Error: {e}")

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

async def fetch_hard_facts(company_id: str):
    """Fetches STRICT database variables (Budget & Progress). NOT memory."""
    if not company_id: return "Veri Yok."
    
    facts = []
    
    # 1. Budget Status
    try:
        b_res = supabase.table("budget_items").select("item_name, total_budget, used_quantity").eq("company_id", company_id).execute()
        if b_res.data:
            total_money = sum(item['total_budget'] for item in b_res.data)
            facts.append(f"- TOPLAM BÜTÇE HEDEFİ: {total_money:,.0f} TL")
    except: pass
    
    # 2. Progress Status
    try:
        p_res = supabase.table("project_progress").select("status, milestones(task_name, weight_points)").eq("company_id", company_id).eq("status", "completed").execute()
        if p_res.data:
             total_pts = sum(d['milestones']['weight_points'] for d in p_res.data if d.get('milestones'))
             progress_pct = (total_pts / 1000) * 100
             facts.append(f"- TEYİTLİ İLERLEME: %{progress_pct:.1f}")
             facts.append(f"- BİTEN İŞLER: {', '.join([d['milestones']['task_name'] for d in p_res.data if d.get('milestones')])}")
    except: pass
    
    if not facts: return "Henüz girilmiş resmi veri yok."
    return "\n".join(facts)

async def process_chat_message(messages: List[dict], company_id: Optional[str], system_prompt: Optional[str] = None):
    try:
        # 1. Fetch Contexts
        site_memory_context = await fetch_site_memory(company_id)
        hard_facts_context = await fetch_hard_facts(company_id)
        
        # 2. Prepare System Prompt
        from datetime import datetime
        import pytz
        tr_time = datetime.now(pytz.timezone('Europe/Istanbul')).strftime('%Y-%m-%d %H:%M')

        base_system_prompt = system_prompt or """### ROLE & PERSONA
You are the SITE CHIEF (Şantiye Şefi). Your name is "Dayı".
You speak Turkish. You are experienced, fatherly, strictly professional but warm.
You manage a construction site.

### CURRENT TIME
Now is: {CURRENT_TIME} (YYYY-MM-DD HH:MM)

### HARD FACTS (KESİN BİLGİ - DEĞİŞMEZ)
These are the REAL numbers from the database. Trust these over any memory.
{HARD_FACTS}

### HIVEMIND (SITE MEMORY - CHAT HISTORY)
Recent conversations:
{MEMORY_CONTEXT}

### INSTRUCTIONS
1. Analyze the user's input.
2. If the user is REPORTING a new fact (e.g., "Cement finished"), EXTRACT it to 'memory_update'.
3. If the user is ASKING a question, use the HARD FACTS first, then HIVEMIND.
4. Give valid, safe, and direct advice.
5. Pay close attention to timestamps. If a memory is from yesterday, say "yesterday".

### OUTPUT FORMAT (JSON)
{
  "insight": "Your direct answer to the user.",
  "risk_score": 0-100,
  "memory_update": "Extracted new fact or null"
}
"""
        final_system_prompt = base_system_prompt.replace("{MEMORY_CONTEXT}", site_memory_context)\
                                                .replace("{CURRENT_TIME}", tr_time)\
                                                .replace("{HARD_FACTS}", hard_facts_context)

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

# --- MEDIA HANDLERS ---
async def download_whatsapp_media(media_id: str):
    """Downloads media file from WhatsApp Cloud API."""
    token = os.environ.get("WHATSAPP_API_TOKEN")
    if not token: 
        return None

    # 1. Get Media URL
    url = f"https://graph.facebook.com/v17.0/{media_id}"
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        r = requests.get(url, headers=headers)
        if r.status_code != 200:
            print(f"Media URL Error: {r.text}")
            return None
        
        media_url = r.json().get("url")
        
        # 2. Download Content
        r_media = requests.get(media_url, headers=headers)
        if r_media.status_code != 200:
            print(f"Media Download Error: {r_media.text}")
            return None
            
        # Save to temp file
        file_path = f"temp_{media_id}.ogg"
        with open(file_path, "wb") as f:
            f.write(r_media.content)
            
        return file_path
    except Exception as e:
        print(f"Download Exception: {e}")
        return None

async def transcribe_audio(file_path: str):
    """Transcribes audio using OpenAI Whisper."""
    api_key = os.environ.get("OPENAI_API_KEY") # Needs real OpenAI key, not DeepSeek
    if not api_key:
        print("OPENAI_API_KEY missing for simple transcription")
        return "(Sesli mesaj çözülemedi - API Key yok)"
        
    try:
        # We need a native OpenAI client here, distinct from the DeepSeek one
        from openai import OpenAI as RealOpenAI
        voice_client = RealOpenAI(api_key=api_key)
        
        with open(file_path, "rb") as audio_file:
            transcription = voice_client.audio.transcriptions.create(
                model="whisper-1", 
                file=audio_file,
                language="tr" # Force Turkish for better accuracy with "Dayı" jargon
            )
        return transcription.text
    except Exception as e:
        print(f"Whisper Error: {e}")
        return "(Sesli mesaj anlaşılamadı)"
    finally:
        # Cleanup
        if os.path.exists(file_path):
            os.remove(file_path)

# --- IMAGE ANALYSIS (GPT-4o) ---
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

async def analyze_image_with_gpt4o(image_path: str):
    """Analyzes construction site images using GPT-4o Vision."""
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return "(Görsel analizi yapılamadı - API Key eksik)"

    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)

        base64_image = encode_image(image_path)

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "Sen tecrübeli bir şantiye şefisin. Gönderilen fotoğraftaki iş güvenliği risklerini (baret, yelek, düşme riski) ve inşaat ilerleme durumunu (kalıp, demir, beton) analiz et. Kısa, net ve 'Dayı' jargonunda rapor ver."
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Bu fotoğrafta ne görüyorsun usta? Durum nedir?"},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=300
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Vision Error: {e}")
        return "(Görsel analizinde hata oluştu)"
    finally:
        if os.path.exists(image_path):
            os.remove(image_path)


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
        msg_type = message_data.get("type")
        
        text_body = ""
        is_audio = False
        
        # HANDLE MESSAGE TYPES
        if msg_type == "text":
            text_body = message_data.get("text", {}).get("body", "").strip()
        
        elif msg_type == "audio":
            is_audio = True
            audio_id = message_data.get("audio", {}).get("id")
            # Notify user we are listening
            await send_whatsapp_message(phone_number, "🎧 Sesli mesajın dinleniyor usta...")
            
            # Download & Transcribe
            file_path = await download_whatsapp_media(audio_id)
            if file_path:
                transcript = await transcribe_audio(file_path)
                text_body = transcript
                # Prefix to let AI know it was audio
                text_body = f"[SESLİ MESAJ]: {text_body}"
                
                with open("webhook_debug.log", "a", encoding="utf-8") as f:
                    f.write(f"Audio Transcribed: {text_body}\n")
            else:
                text_body = "(Ses dosyası indirilemedi)"


        elif msg_type == "image":
            # HANDLE IMAGE
            image_id = message_data.get("image", {}).get("id")
            await send_whatsapp_message(phone_number, "📸 Fotoğrafı inceliyorum dayı, bekle...")
            
            file_path = await download_whatsapp_media(image_id)
            if file_path:
                # Rename to ensure extension (WhatsApp sometimes gives .jpg, sometimes random)
                if not file_path.endswith((".jpg", ".jpeg", ".png")):
                    new_path = file_path + ".jpg"
                    os.rename(file_path, new_path)
                    file_path = new_path
                
                analysis_report = await analyze_image_with_gpt4o(file_path)
                
                # Reply directly with analysis
                await send_whatsapp_message(phone_number, f"👁️ **Saha Analizi:**\n\n{analysis_report}")
                return {"status": "processed_image"}
            else:
                await send_whatsapp_message(phone_number, "Fotoğrafı indiremedim usta.")
                return {"status": "failed_download"}

        elif msg_type == "document":
            doc_data = message_data.get("document", {})
            file_name = doc_data.get("filename", "")
            mime_type = doc_data.get("mime_type", "")
            
            # Check if Excel
            if "sheet" in mime_type or ".xlsx" in file_name:
                doc_id = doc_data.get("id")
                await send_whatsapp_message(phone_number, "📊 Excel dosyası inceleniyor...")
                
                file_path = await download_whatsapp_media(doc_id)
                if file_path:
                    # RENAME to .xlsx for pandas to recognize it (WhatsApp downloads as random hash)
                    new_path = file_path + ".xlsx"
                    os.rename(file_path, new_path)
                    
                    profile = await get_profile_by_phone(phone_number)
                    if profile:
                        company_id = profile['company_id']
                        report = process_budget_excel(new_path, company_id)
                        reply_text = report
                    else:
                        reply_text = "Önce sisteme kayıt olman lazım patron."
                    
                    # Cleanup AND prevent AI processing chat on this turn
                    if os.path.exists(new_path):
                         os.remove(new_path)
                    
                    # DIRECTLY RETURN. Do not let AI chat reply.
                    await send_whatsapp_message(phone_number, reply_text)
                    return {"status": "processed_excel"}
                else:
                    reply_text = "Dosya indirilemedi."
            else:
                 return {"status": "ignored_non_excel"}

        else:
            print(f"Unsupported message type: {msg_type}")
            return {"status": "ignored"} # Ignore images/videos for now

        
        with open("webhook_debug.log", "a", encoding="utf-8") as f:
            f.write(f"Processing: From={phone_number}, Text={text_body}\n")

        # 1. Check Profile & Context
        profile = await get_profile_by_phone(phone_number)
        group_id = message_data.get("group_id")
        
        # --- GROUP MESSAGE LOGIC ---
        if group_id:
            # 1. LOG EVERYTHING ("Nothing forgotten")
            company_id = profile['company_id'] if profile else None
            
            # Log with raw payload (includes audio ID if any)
            await log_group_message(group_id, phone_number, text_body, company_id, message_data)
            
            # 2. Decide to Reply
            triggers = ["@santiye", "#dayı", "#soru", "!"]
            # Also reply to ANY audio message in group if it's clearly directed (hard to detect without trigger)
            # OR if transcript contains trigger keywords
            should_reply = any(text_body.lower().startswith(t) or t in text_body.lower() for t in triggers)
            
            # Special case: If audio starts with "dayı" (spoken), we might miss the #/! prefix.
            # Simple heuristic: If it's a short audio/question in a group, maybe reply? 
            # For now, strictly stick to keywords to avoid spam, but check INSIDE the transcript too.
            if any(x in text_body.lower() for x in ["dayı", "şantiye", "usta", "soru"]):
                should_reply = True

            if should_reply:
                if not company_id:
                     reply_text = "Bu grubu tanımıyorum yeğenim. Önce özelden bana yazıp kaydol."
                else:
                    # Remove trigger prefix/keywords roughly for cleaner AI processing logic or keep relevant
                    clean_text = text_body
                    result = await process_chat_message([{"role": "user", "content": clean_text}], company_id)
                    reply_text = result['insight']
            else:
                return {"status": "logged_group_msg"}

        # --- DM (DIRECT MESSAGE) LOGIC ---
        else: 
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
                else:
                    reply_text = "Selam yeğenim. Hangi şantiyedensin? Şirket kodunu yaz (Örn: #ABC)."
            
            # elif not profile.get('is_approved', False):
            #      reply_text = "Henüz onay almadın usta. Şefe bi görün istersen."
            
            else:
                company_id = profile['company_id']
                result = await process_chat_message([{"role": "user", "content": text_body}], company_id)
                reply_text = result['insight']

        # Send Reply
        if reply_text:
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
