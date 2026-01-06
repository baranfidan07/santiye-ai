-- BUDGET & MATERIALS TRACKING
-- Excel'den okunan maliyet verilerini burada tutacağız.

CREATE TABLE IF NOT EXISTS budget_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) NOT NULL,
    
    item_name TEXT NOT NULL, -- Örn: "Çimento (PÇ 42.5)"
    unit TEXT DEFAULT 'Adet', -- Örn: "Torba", "Ton"
    
    unit_price DECIMAL(15, 2) DEFAULT 0, -- Birim Fiyat (TL)
    
    planned_quantity DECIMAL(15, 2) DEFAULT 0, -- Hedeflenen Miktar
    used_quantity DECIMAL(15, 2) DEFAULT 0, -- Harcanan Miktar (Chat'ten güncellenecek)
    
    total_budget DECIMAL(15, 2) GENERATED ALWAYS AS (unit_price * planned_quantity) STORED, -- Toplam Tahmini Bütçe
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manage Own Budget" ON budget_items
FOR ALL USING (company_id IN (
    SELECT company_id FROM profiles WHERE user_id = auth.uid() OR phone_number = current_setting('app.current_phone', true)
));
