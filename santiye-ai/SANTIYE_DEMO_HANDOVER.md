# 🚧 ŞANTİYE AI - PROJE DOSYASI (ARŞİV)
**Tarih:** 6 Ocak 2026
**Durum:** Beklemeye Alındı (Archived)

Bu proje, bir inşaat şantiye yönetim asistanı demosu olarak geliştirilmiştir.
WhatsApp üzerinden "Dayı" (Şantiye Şefi) personası ile çalışır.

## 🚀 Sistemi Tekrar Ayağa Kaldırma (Resume)

### 1. Backend (Beyin)
```bash
cd santiye-ai/backend
uvicorn main:app --reload
```
*Port:* `localhost:8000`

### 2. Frontend (Panel)
```bash
cd ask-analiz-web/frontend
npm run dev
```
*Port:* `localhost:3000`

## 🔑 Gerekli Şifreler (.env)
Aşağıdaki değişkenlerin `backend/.env` dosyasında olduğundan emin olun:
- `OPENAI_API_KEY`: (Vision & Whisper için)
- `DEEPSEEK_API_KEY`: (Sohbet zekası için)
- `SUPABASE_URL` & `KEY`: (Veritabanı)
- `WHATSAPP_VERIFY_TOKEN`: (Meta bağlantısı)

## 🧠 Özellik Durumu
- **Vision (Saha Gözü):** ✅ Aktif (GPT-4o)
- **Hafıza (Memory):** ✅ Aktif (Son 6 mesajı hatırlar)
- **Persona:** ✅ "Kısa ve Öz" (Meşgul Foremen Modu)
- **Onay Sistemi:** 🔓 Kapalı (Herkes girebilir)

## 📂 Veritabanı Notu
Hafıza özelliğinin çalışması için Supabase'de `dm_logs` ve `site_memory` tablolarının açık olması gerekir.

---
*Bu dosya, projeye kaldığı yerden devam etmek için rehberdir.*
