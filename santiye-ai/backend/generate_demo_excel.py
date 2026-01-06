import pandas as pd
import os

# Demo Data: Realistic Construction Items
data = [
    # KABA YAPI (Rough Construction)
    {"Malzeme": "C30 Hazır Beton", "Birim": "m3", "Birim Fiyat": 2500, "Miktar": 120},
    {"Malzeme": "Ø14 Nervürlü Demir", "Birim": "Ton", "Birim Fiyat": 24000, "Miktar": 15},
    {"Malzeme": "Tuğla (19'luk)", "Birim": "Adet", "Birim Fiyat": 8.5, "Miktar": 5000},
    {"Malzeme": "Kalıp Kerestesi", "Birim": "m3", "Birim Fiyat": 12000, "Miktar": 5},
    
    # İNCE İŞLER (Fine Works)
    {"Malzeme": "Alçı Sıva (Torba)", "Birim": "Torba", "Birim Fiyat": 150, "Miktar": 200},
    {"Malzeme": "Saten Boya (20kg)", "Birim": "Kova", "Birim Fiyat": 2500, "Miktar": 10},
    {"Malzeme": "Seramik (60x120)", "Birim": "m2", "Birim Fiyat": 650, "Miktar": 150},
    {"Malzeme": "Laminat Parke", "Birim": "m2", "Birim Fiyat": 450, "Miktar": 100},
    
    # TESİSAT (MEP)
    {"Malzeme": "PPRC Boru (20mm)", "Birim": "Metre", "Birim Fiyat": 45, "Miktar": 300},
    {"Malzeme": "Elektrik Kablosu (3x2.5)", "Birim": "Metre", "Birim Fiyat": 35, "Miktar": 500},
    {"Malzeme": "Viko Priz Anahtar", "Birim": "Adet", "Birim Fiyat": 85, "Miktar": 50},
    {"Malzeme": "LED Panel Armatür", "Birim": "Adet", "Birim Fiyat": 250, "Miktar": 20}
]

# Create DataFrame directly
df = pd.DataFrame(data)

# Output File
output_file = "Santiye_Demo_Butce_Plani.xlsx"
path = os.path.join(os.getcwd(), output_file)

# Write to Excel
try:
    df.to_excel(path, index=False)
    print(f"✅ Excel dosyası oluşturuldu: {path}")
    print(f"Bu dosyayı WhatsApp'tan bota göndererek 'Maliyet Analizi' demosunu yapabilirsiniz.")
except Exception as e:
    print(f"Hata: {e}")
