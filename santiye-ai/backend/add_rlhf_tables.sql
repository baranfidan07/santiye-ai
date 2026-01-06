-- RLHF Dataset: Fine-Tuning için Veri Havuzu
-- Yapay zeka'nın "tahminlerini" ve "insan teyidini" burada saklayacağız.
-- Bu tablo ileride modeli eğitmek (Fine-Tune) için altın değerinde olacak.

CREATE TABLE IF NOT EXISTS rlhf_dataset (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    
    -- INPUT: AI'ya ne sorduk/verdik?
    input_context TEXT, 
    
    -- OUTPUT: AI ne dedi? (Tahmin)
    ai_prediction TEXT,
    
    -- REWARD: İnsan ne dedi? (True = Aferin, False = Yanlış)
    human_feedback BOOLEAN, 
    
    -- METADATA
    confidence_score FLOAT, -- AI kendine ne kadar güveniyordu?
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İstatistik Çıkarma (Accuracy Rate)
-- Örn: "AI son 30 günde %85 doğru tahmin yaptı."
CREATE VIEW ai_performance_stats AS
SELECT 
    company_id,
    COUNT(*) as total_predictions,
    SUM(CASE WHEN human_feedback = TRUE THEN 1 ELSE 0 END) as correct_predictions,
    (SUM(CASE WHEN human_feedback = TRUE THEN 1 ELSE 0 END)::float / COUNT(*)) * 100 as accuracy_rate
FROM rlhf_dataset
GROUP BY company_id;

ALTER TABLE rlhf_dataset ENABLE ROW LEVEL SECURITY;
