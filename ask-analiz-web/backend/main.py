import os
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Union
from dotenv import load_dotenv
from openai import OpenAI
import json

# Load environment variables
load_dotenv()

app = FastAPI()

# Initialize OpenAI (DeepSeek)
# Ensure the key is loaded
api_key = os.getenv("DEEPSEEK_API_KEY")
if not api_key:
    print("Warning: DEEPSEEK_API_KEY not found in environment variables.")

# DeepSeek Configuration
client = OpenAI(
    api_key=api_key,
    base_url="https://api.deepseek.com"
)

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://ask-analiz-web-frontend.vercel.app", # Add Vercel domain
    "https://askanaliz.com",
    "https://www.askanaliz.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    # Support both simple string content and complex list (text + image)
    messages: List[Dict[str, Union[str, List[Dict[str, Any]]]]]
    # Optional: Allow frontend to pass the active persona's prompt
    system_prompt: Union[str, None] = None

@app.post("/analyze")
async def analyze_relationship(request: AnalyzeRequest):
    try:
        if not api_key:
            raise HTTPException(status_code=500, detail="DeepSeek API Key missing on backend.")

        # Use the system prompt provided by frontend (Dynamic Persona)
        # Fallback to a default if missing
        system_prompt = request.system_prompt
        
        if not system_prompt:
             system_prompt = """### ROLE & PERSONA
             Sen "Aşk Analiz"sin. (Fallback Prompt)
             ...
             """

        # Call DeepSeek
        # System prompt needs to be prepended
        full_messages = [{"role": "system", "content": system_prompt}] + request.messages

        response = client.chat.completions.create(
            model="deepseek-chat", 
            messages=full_messages,
            response_format={"type": "json_object"},
            temperature=0.7,
        )

        content = response.choices[0].message.content
        result = json.loads(content)
        
        return result

    except Exception as e:
        print(f"Error: {e}")
        # Return a fallback if API fails so app doesn't crash
        return {
             "risk_score": 50,
             "insight": f"Analiz sunucusu hatası: {str(e)}. Lütfen daha sonra tekrar deneyin."
        }

@app.post("/generate-confession")
async def generate_confession(request: AnalyzeRequest):
    try:
        if not api_key:
            raise HTTPException(status_code=500, detail="API Key missing.")

        prompt = """
        GÖREV: SOHBETİ "DEDİKODU/STORYTIME" FORMATINA ÇEVİRME
        
        Sana verilen sohbet geçmişini okuyup, tek bir paragraflık, Sürükleyici ve Anonim bir hikaye yazacaksın.
        
        KURALLAR:
        1. "Tıpatıp Sohbet Kopyası" YAZMA! Olayın özünü çıkar ve kendi cümlelerinle anlat.
        2. ANLATICI DİLİ: "Ben" dili kullan. Sanki yakın arkadaşına dert yanıyorsun. 
           - Örnek: "Ya kızlar inanamazsınız, çocuk bana resmen şunu dedi..."
           - Örnek: "1 aydır konuştuğum biri var, her şey harikaydı ama dün..."
        3. ANONİMLEŞTİR: İsimler (Ahmet, Ayşe) yerine "Flörtüm", "Eski sevgilim", "O" kullan. Yer/Mekan isimlerini sil.
        4. ABSÜRT DETAYLARI VURGULA: Olaydaki gariplikleri ön plana çıkar.
        5. FİNALİ SORU İLE BİTİR: Okuyuculara "Sizce ne yapmalıyım?", "Bu normal mi?", "Ben mi abartıyorum?" gibi bir soru sor.
        6. Uzunluk: Maksimum 400 karakter (Twitter sığacak kadar kısa ama detaylı).
        7. ASLA RÜYA GÖRME: Olmayan olayları uydurma. Sadece sohbette geçen gerçekleri kullan ama süsleyerek anlat.

        ÇIKTI FORMATI:
        Sadece hikayeyi ver. Tırnak işareti, başlık vs ekleme.
        """

        full_messages = [{"role": "system", "content": prompt}] + request.messages

        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=full_messages,
            temperature=0.8, # Creative
        )

        content = response.choices[0].message.content
        return {"confession_text": content}

    except Exception as e:
        print(f"Error: {e}")
        return {"confession_text": "İşler biraz karışık... Ama anonim olarak paylaşmak istiyorum."}

@app.get("/")
def read_root():
    return {"status": "AskAnaliz Backend Running (DeepSeek Enabled)"}
