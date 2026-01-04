"""
Kızlar Soruyor Scraper - İtiraf Feed Data Populator
====================================================
Bu script kizlarsoruyor.com'dan ilişki içeriklerini çeker ve 
Supabase confessions tablosuna ekler.

Kullanım:
1. pip install requests beautifulsoup4 python-dotenv supabase
2. .env dosyasında SUPABASE_URL ve SUPABASE_KEY ayarlayın
3. python scrape_confessions.py
"""

import os
import time
import random
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from multiple possible locations
from pathlib import Path

# Try to find .env file in various locations
env_paths = [
    Path(__file__).parent / ".env",
    Path(__file__).parent.parent / "frontend" / ".env.local",
    Path(__file__).parent.parent / ".env.local",
]

for env_path in env_paths:
    if env_path.exists():
        load_dotenv(env_path)
        print(f"📁 Loaded env from: {env_path}")
        break

# Supabase config
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL") or os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_KEY")

# Interactive fallback if env vars not found
if not SUPABASE_URL:
    print("⚠️ SUPABASE_URL bulunamadı. Lütfen manuel girin:")
    SUPABASE_URL = input("Supabase URL: ").strip()

if not SUPABASE_KEY:
    print("⚠️ SUPABASE_KEY bulunamadı. Lütfen manuel girin:")
    SUPABASE_KEY = input("Supabase Anon Key: ").strip()

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Hata: Supabase bilgileri eksik!")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Browser-like headers to avoid 403
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
}

# Categories to scrape
CATEGORIES = [
    ("https://www.kizlarsoruyor.com/iliski-sorunlari", "İlişki"),
    ("https://www.kizlarsoruyor.com/erkek-kiz-iliskileri", "Flört"),
    ("https://www.kizlarsoruyor.com/evlilik", "Evlilik"),
]

def fetch_page(url):
    """Fetch a page with browser-like headers"""
    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        print(f"⚠️ Sayfa alınamadı: {url} - {e}")
        return None

def parse_questions(html, category):
    """Parse questions from the page HTML"""
    soup = BeautifulSoup(html, "html.parser")
    questions = []
    
    # Find question items - adjust selectors based on actual site structure
    question_items = soup.select(".question-item, .feed-item, article.question")
    
    if not question_items:
        # Try alternative selectors
        question_items = soup.select("[class*='question'], [class*='post'], .listItem")
    
    for item in question_items[:20]:  # Limit to 20 per category
        try:
            # Try to find title/hook
            title_el = item.select_one("h2, h3, .question-title, .title, a.question-link")
            content_el = item.select_one(".question-content, .excerpt, .description, p")
            
            title = title_el.get_text(strip=True) if title_el else None
            content = content_el.get_text(strip=True) if content_el else ""
            
            if title and len(title) > 10:
                # Combine title and content
                full_content = f"{title}\n\n{content}" if content else title
                
                questions.append({
                    "content": full_content[:2000],  # Limit length
                    "category": category,
                    "toxic_score": random.randint(40, 95),  # Random for demo
                    "like_count": random.randint(10, 500),
                })
        except Exception as e:
            print(f"⚠️ Parse hatası: {e}")
            continue
    
    return questions

def insert_to_supabase(questions):
    """Insert questions into Supabase confessions table"""
    if not questions:
        return 0
    
    try:
        result = supabase.table("confessions").insert(questions).execute()
        return len(result.data) if result.data else 0
    except Exception as e:
        print(f"❌ Supabase insert hatası: {e}")
        return 0

def generate_sample_data():
    """Generate sample Turkish relationship confessions if scraping fails"""
    samples = [
        {
            "content": "Sevgilim beni aldatıyor mu bilmiyorum ama sürekli telefonunu saklıyor\n\n3 yıllık ilişkimiz var. Son zamanlarda telefonunu sürekli ekranı aşağı bakacak şekilde koyuyor. Şifresini değiştirmiş, sormaya korkuyorum. Paranoyak mıyım yoksa gerçekten bir şeyler mi dönüyor?",
            "category": "Aldatma",
            "toxic_score": 85,
            "like_count": random.randint(100, 500),
        },
        {
            "content": "Eski sevgilimi unutamıyorum yeni ilişkiye başladım ama hala onu düşünüyorum\n\n6 ay önce ayrıldık. Yeni biriyle tanıştım, çok iyi biri ama aklım hep eskide. Bu yeni insana haksızlık mı ediyorum? Nasıl unuturum?",
            "category": "Ayrılık",
            "toxic_score": 45,
            "like_count": random.randint(50, 300),
        },
        {
            "content": "Erkek arkadaşım eski sevgilisiyle hala konuşuyor, 'sadece arkadaşız' diyor\n\nBunu kabul etmem mi gerekiyor? Her hafta kahve içmeye gidiyorlar. Rahatsız olduğumu söyledim ama 'abartıyorsun' dedi.",
            "category": "Red Flags",
            "toxic_score": 78,
            "like_count": random.randint(200, 600),
        },
        {
            "content": "Sevgilim sosyal medyada başka kızların fotoğraflarını beğeniyor\n\nBikini fotoğrafları, makyaj videoları... Sorduğumda 'ne var bunda' diyor. Aşırı mı tepki veriyorum?",
            "category": "Güven",
            "toxic_score": 62,
            "like_count": random.randint(80, 400),
        },
        {
            "content": "4 yıllık ilişkiden sonra evlilik teklifi gelmedi, beklemeli miyim?\n\nO 'daha erken' diyor ama yaşım ilerliyor. Ultimatom vermeli miyim yoksa beklemeli miyim? Kafam çok karışık.",
            "category": "Evlilik",
            "toxic_score": 35,
            "like_count": random.randint(150, 450),
        },
        {
            "content": "İlk buluşmada öpüştük, şimdi mesajlarıma cevap vermiyor\n\nHer şey çok güzel gitti sanıyordum. Neden ghostladı? Ne yanlış yaptım anlamıyorum.",
            "category": "Flört",
            "toxic_score": 55,
            "like_count": random.randint(60, 250),
        },
        {
            "content": "Sevgilimin ailesini hiç sevmiyorum, evlensek bile ayrı yaşamak istiyorum\n\nAnlayışsız ve müdahaleciler. Onu seviyorum ama ailesiyle aynı şehirde bile yaşamak istemiyorum. Bencil miyim?",
            "category": "Aile",
            "toxic_score": 48,
            "like_count": random.randint(90, 350),
        },
        {
            "content": "Aldatıldım ama onu hala seviyorum, affetmeli miyim?\n\nBir kerelik hata olduğunu söylüyor, çok pişman. 5 yıllık ilişkiyi bu yüzden bitirebilir miyim? Kafam çok karışık.",
            "category": "Aldatma",
            "toxic_score": 92,
            "like_count": random.randint(300, 800),
        },
        {
            "content": "Uzak mesafe ilişki yapıyoruz, artık dayanamıyorum\n\n2 yıldır farklı şehirlerdeyiz. Ayda bir görüşüyoruz. Onu seviyorum ama bu böyle devam edemez. Ne yapmalıyım?",
            "category": "Uzak Mesafe",
            "toxic_score": 40,
            "like_count": random.randint(100, 400),
        },
        {
            "content": "Erkek arkadaşım kıskançlık krizleri geçiriyor, normal mi?\n\nErkek arkadaşlarımla konuşmamı istemiyor. Kıyafetlerime karışıyor. 'Çok sevdiğim için' diyor ama bu sağlıklı mı?",
            "category": "Manipülasyon",
            "toxic_score": 88,
            "like_count": random.randint(200, 600),
        },
    ]
    return samples

def main():
    print("🚀 Kızlar Soruyor Scraper Başlatılıyor...")
    print(f"📊 Supabase URL: {SUPABASE_URL[:30]}...")
    
    total_inserted = 0
    
    # Try to scrape each category
    for url, category in CATEGORIES:
        print(f"\n📥 Kategori: {category} - {url}")
        
        html = fetch_page(url)
        if html:
            questions = parse_questions(html, category)
            if questions:
                inserted = insert_to_supabase(questions)
                total_inserted += inserted
                print(f"   ✅ {inserted} itiraf eklendi")
            else:
                print(f"   ⚠️ Soru bulunamadı, sayfa yapısı değişmiş olabilir")
        
        # Rate limiting
        time.sleep(random.uniform(1, 3))
    
    # If scraping didn't work, insert sample data
    if total_inserted == 0:
        print("\n⚠️ Web scraping başarısız (site engelliyor olabilir)")
        print("📝 Örnek veriler ekleniyor...")
        
        samples = generate_sample_data()
        inserted = insert_to_supabase(samples)
        total_inserted = inserted
        print(f"   ✅ {inserted} örnek itiraf eklendi")
    
    print(f"\n🎉 Tamamlandı! Toplam {total_inserted} itiraf eklendi.")
    print("   Feed'i yenileyerek kontrol edebilirsiniz: https://askanaliz.com/confessions")

if __name__ == "__main__":
    main()
