import pandas as pd
import os
from datetime import datetime

# Demo Data: PROFESSIONAL Construction Items (Ministry Pose Codes)
# Kaynak: Çevre ve Şehircilik Bakanlığı Birim Fiyatları Temsili Verileri
data = [
    # KABA YAPI (Giriş)
    {"Poz No": "Y.15.001/2B", "İmalat Adı": "Makine ile Her Türlü Zeminde Kazı Yapılması", "Birim": "m3", "Birim Fiyat": 150.00, "Miktar": 5000},
    {"Poz No": "Y.16.050/03", "İmalat Adı": "C 30/37 Hazır Beton Dökülmesi (Pompalı)", "Birim": "m3", "Birim Fiyat": 3200.00, "Miktar": 1200},
    {"Poz No": "Y.23.014", "İmalat Adı": "Ø 8-12 mm Nervürlü Beton Çelik Çubuğu", "Birim": "Ton", "Birim Fiyat": 24500.00, "Miktar": 85},
    {"Poz No": "Y.23.015", "İmalat Adı": "Ø 14-32 mm Nervürlü Beton Çelik Çubuğu", "Birim": "Ton", "Birim Fiyat": 24000.00, "Miktar": 150},
    {"Poz No": "Y.21.001/03", "İmalat Adı": "Plywood Kalıp Yapılması", "Birim": "m2", "Birim Fiyat": 850.00, "Miktar": 3500},
    
    # DUVAR & SIVA
    {"Poz No": "Y.18.001/C03", "İmalat Adı": "19'luk Yatay Delikli Tuğla Duvar", "Birim": "m2", "Birim Fiyat": 450.00, "Miktar": 2500},
    {"Poz No": "Y.27.501/02", "İmalat Adı": "Kireç-Çimento Karışımı Kaba Sıva", "Birim": "m2", "Birim Fiyat": 220.00, "Miktar": 4500},
    {"Poz No": "Y.27.531", "İmalat Adı": "Alçı Sıva Yapılması (Perlitli)", "Birim": "m2", "Birim Fiyat": 180.00, "Miktar": 4500},
    
    # BOYA & KAPLAMA
    {"Poz No": "Y.25.003/15", "İmalat Adı": "Su Bazlı Saten Boya Yapılması", "Birim": "m2", "Birim Fiyat": 120.00, "Miktar": 4000},
    {"Poz No": "Y.26.005/303", "İmalat Adı": "60x120 cm Granit Seramik Döşeme", "Birim": "m2", "Birim Fiyat": 950.00, "Miktar": 1200},
    
    # MEKANİK & ELEKTRİK (Basitleştirilmiş)
    {"Poz No": "MEK.101-1", "İmalat Adı": "PPRC Temiz Su Tesisatı Ø20", "Birim": "mt", "Birim Fiyat": 65.00, "Miktar": 1500},
    {"Poz No": "ELK.202-3", "İmalat Adı": "NHXMH Halojensiz Kablo 3x2.5", "Birim": "mt", "Birim Fiyat": 45.00, "Miktar": 2500}
]

# Create DataFrame directly
df = pd.DataFrame(data)

# Calculate Total
df['Toplam Tutar'] = df['Birim Fiyat'] * df['Miktar']

# Rename for Compatibility with Backend Parser (if needed) but keeping Pro names
# Our parser 'excel_loader.py' looks for: Malzeme, Birim, Fiyat, Miktar
# Let's map headers to be safe for our simple parser while looking PRO
df = df.rename(columns={
    "İmalat Adı": "Malzeme Adı", # Compatible
    "Birim Fiyat": "Birim Fiyat (TL)",
    "Miktar": "Miktar (Planlanan)"
})

# Output File
output_file = "Santiye_Hakedis_Cetveli_Demo.xlsx"
path = os.path.join(os.getcwd(), output_file)

# Write to Excel
try:
    df.to_excel(path, index=False)
    print(f"✅ PROFESYONEL Excel dosyası oluşturuldu: {path}")
    print(f"Çevre ve Şehircilik Bakanlığı poz numaraları kullanıldı.")
except Exception as e:
    print(f"Hata: {e}")
