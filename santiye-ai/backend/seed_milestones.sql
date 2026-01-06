-- Puanlama Sistemi Başlangıç Verisi (1000 Puan)
-- Bu verileri 'milestones' tablosuna ekleyin.

INSERT INTO milestones (phase_name, task_name, weight_points, display_order) VALUES
-- 1. KABA YAPI (%40 - 400 Puan)
('Kaba Yapı', 'Hafriyat ve Zemin İşleri', 50, 1),
('Kaba Yapı', 'Temel Betonu', 100, 2),
('Kaba Yapı', 'Karkas (Kolon/Kiriş/Döşeme)', 200, 3),
('Kaba Yapı', 'Çatı ve İzolasyon', 50, 4),

-- 2. İNCE İŞLER (%40 - 400 Puan)
('İnce İşler', 'Duvar Örümü', 80, 5),
('İnce İşler', 'Sıva ve Alçı', 80, 6),
('İnce İşler', 'Zemin Kaplama (Parke/Seramik)', 80, 7),
('İnce İşler', 'Boya ve Badana', 60, 8),
('İnce İşler', 'Kapı ve Pencere Montajı', 100, 9),

-- 3. TESİSAT (%15 - 150 Puan)
('Tesisat', 'Elektrik Altyapısı', 75, 10),
('Tesisat', 'Sıhhi Tesisat', 75, 11),

-- 4. PEYZAJ & TESLİM (%5 - 50 Puan)
('Peyzaj ve Teslim', 'Çevre Düzenleme', 30, 12),
('Peyzaj ve Teslim', 'Temizlik ve İskan', 20, 13);
