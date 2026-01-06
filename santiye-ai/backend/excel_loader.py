import pandas as pd
import os
from supabase import create_client, Client

# Initialize Supabase Client (Reusing env vars)
supabase: Client = create_client(
    os.environ.get("NEXT_PUBLIC_SUPABASE_URL", ""),
    os.environ.get("SUPABASE_SERVICE_KEY", "")
)

def process_budget_excel(file_path: str, company_id: str) -> str:
    """
    Reads an Excel file and imports budget items into Supabase.
    Expected Columns: 'Malzeme', 'Birim', 'Birim Fiyat', 'Bütçelenen Miktar'
    """
    try:
        # 1. Read Excel
        df = pd.read_excel(file_path)
        
        # 2. Normalize Headers (Simple heuristic)
        # Map common Turkish headers to English keys
        column_map = {
            "Malzeme": "item_name",
            "Malzeme Adı": "item_name",
            "Kalem": "item_name",
            "Birim": "unit",
            "Birim Fiyat": "unit_price",
            "Fiyat": "unit_price",
            "Miktar": "planned_quantity",
            "Adet": "planned_quantity",
            "Bütçelenen Miktar": "planned_quantity"
        }
        df = df.rename(columns=column_map)
        
        # 3. Validate Required Columns
        required = ["item_name", "unit_price", "planned_quantity"]
        missing = [col for col in required if col not in df.columns]
        if missing:
            return f"❌ Hata: Excel dosyasında şu sütunlar eksik: {', '.join(missing)}. Lütfen 'Malzeme', 'Birim Fiyat', 'Miktar' sütunlarını kontrol et."

        # 4. Process Rows
        count = 0
        total_budget = 0
        
        items_to_insert = []
        for _, row in df.iterrows():
            # Clean data
            name = str(row['item_name']).strip()
            if not name or name.lower() == 'nan': continue
            
            price = float(str(row['unit_price']).replace(',', '.').replace('TL', '').strip() or 0)
            qty = float(str(row['planned_quantity']).replace(',', '.').strip() or 0)
            unit = str(row.get('unit', 'Adet')).strip()
            
            items_to_insert.append({
                "company_id": company_id,
                "item_name": name,
                "unit": unit,
                "unit_price": price,
                "planned_quantity": qty,
                "used_quantity": 0 # Start fresh
            })
            total_budget += (price * qty)
            count += 1
            
        # 5. Bulk Insert (or Upsert)
        if items_to_insert:
            # We delete old budget for this company to avoid duplicates? 
            # Or just add? For a V1, let's Append. Or clear mostly?
            # Let's just Append for now. User is responsible.
            res = supabase.table("budget_items").insert(items_to_insert).execute()
            
        return f"✅ Başarılı! {count} kalem eklendi. Toplam Bütçe: {total_budget:,.2f} TL."

    except Exception as e:
        print(f"Excel Error: {e}")
        return f"❌ Dosya okunamadı: {str(e)}"
