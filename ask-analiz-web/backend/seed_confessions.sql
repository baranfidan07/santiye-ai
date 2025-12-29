-- Delete all existing confessions and seed with viral Turkish debates
-- Run this in Supabase SQL Editor

-- Step 1: Add vote_type column if it doesn't exist
ALTER TABLE confessions ADD COLUMN IF NOT EXISTS vote_type TEXT DEFAULT 'toxic_or_valid';

-- Step 2: Delete all existing confessions
DELETE FROM confessions;

-- Step 3: Seed with viral Turkish Twitter debates (using all vote types)

-- 1. red_flag - Trust issues
INSERT INTO confessions (content, category, toxic_score, like_count, dislike_count, locale, vote_type) VALUES
('Sevgilimin telefonunda kilitli bir uygulama buldum

3 yıllık sevgilim telefonunu her zaman yüzüstü koyuyor. Dün gece uyurken telefonu aldım, "Hesap Makinesi" uygulaması şifre istedi. Sorduğumda "iş için" dedi ama freelancer bile değil. Red flag mi yoksa paranoya mı?', 'İlişki', 75, 234, 89, 'tr', 'red_flag');

-- 2. talk_or_ignore - Communication
INSERT INTO confessions (content, category, toxic_score, like_count, dislike_count, locale, vote_type) VALUES
('Görüldü atıp 3 gün cevap vermiyor

Tinder''dan eşleştik, ilk buluşma süperdi. "Görüşürüz" dedi ama 3 gündür mesajlarıma görüldü atıyor. Arkadaşlarım "tekrar yaz" diyor ama gururum izin vermiyor. Ne yapmalıyım?', 'Flört', 60, 456, 123, 'tr', 'talk_or_ignore');

-- 3. stay_or_leave - Relationship decision
INSERT INTO confessions (content, category, toxic_score, like_count, dislike_count, locale, vote_type) VALUES
('5 yıllık ilişkide artık heyecan yok

Her şey rutin oldu. Seviyorum ama aşık değilim sanırım. O beni çok seviyor, ayrılsam mahvolurum diyor. 28 yaşındayım, yeniden başlamak mı yoksa bu güvenli limanda kalmak mı?', 'İlişki', 45, 678, 234, 'tr', 'stay_or_leave');

-- 4. text_or_not - First move
INSERT INTO confessions (content, category, toxic_score, like_count, dislike_count, locale, vote_type) VALUES
('Ex 2 yıl sonra story''me cevap verdi

2 yıl önce beni aldattığı için ayrılmıştık. Dün attığım İstanbul story''sine "Vay be, hala orada mısın?" yazdı. Kalp atıyor hala ama aklım durma diyor. Cevap vermeli miyim?', 'Ex', 80, 890, 345, 'tr', 'text_or_not');

-- 5. apologize_or_stand - Conflict
INSERT INTO confessions (content, category, toxic_score, like_count, dislike_count, locale, vote_type) VALUES
('Sevgilimin ailesine laf söyledim kavga çıktı

Kayınvalidem sürekli "Ne zaman evleniyorsunuz?" diye soruyor. Dün dayanamadım "Biz karar veririz" dedim sert bir şekilde. Sevgilim özür dilememimi istiyor. Haklı mıyım?', 'İlişki', 55, 567, 432, 'tr', 'apologize_or_stand');

-- 6. set_boundary - Boundaries
INSERT INTO confessions (content, category, toxic_score, like_count, dislike_count, locale, vote_type) VALUES
('Sevgilim eski kız arkadaşıyla hala konuşuyor

"Sadece arkadaşız" diyor ama her gün mesajlaşıyorlar. Geçen hafta kahve içmişler, bana söylememiş. Kısıtlamak istemiyorum ama bu normal mi?', 'İlişki', 70, 789, 156, 'tr', 'set_boundary');

-- 7. overreacting - Paranoia check
INSERT INTO confessions (content, category, toxic_score, like_count, dislike_count, locale, vote_type) VALUES
('Sevgilim geç saatte spor salonuna gidiyor

Yeni bir iş başladı ve "ancak gece 11''de boş oluyor" diyor. Salonda kadın hocayla çalışıyormuş. Paranoyak mı oluyorum yoksa haklı mıyım?', 'İlişki', 50, 432, 567, 'tr', 'overreacting');

-- 8. suspicious - Cheating signs
INSERT INTO confessions (content, category, toxic_score, like_count, dislike_count, locale, vote_type) VALUES
('Sevgilim iş seyahatinden yeni parfümle döndü

3 günlük Ankara seyahatinden döndü. Valizinde tanımadığım bir parfüm vardı. Sorduğumda "Arkadaşlar hediye etti" dedi. Kadın parfümü değil ama garip kokuyor...', 'Toksik', 85, 1203, 234, 'tr', 'suspicious');

-- 9. toxic_or_valid - General judgment
INSERT INTO confessions (content, category, toxic_score, like_count, dislike_count, locale, vote_type) VALUES
('Sevgilim Instagram''da beğendiğim fotoğrafları kontrol ediyor

Her akşam "Bugün kimleri beğendin?" diye soruyor. Kızların profillerine bakıyormuşum, açıklama istiyormuş. Bunu yapması normal mi?', 'Toksik', 65, 876, 543, 'tr', 'toxic_or_valid');

-- 10. jealous_or_careful - Jealousy
INSERT INTO confessions (content, category, toxic_score, like_count, dislike_count, locale, vote_type) VALUES
('Sevgilimin en yakın arkadaşı erkek ve her gün buluşuyorlar

"Çocukluk arkadaşı" diyor ama her gün öğle yemeğinde buluşuyorlar, geceleri uzun uzun mesajlaşıyorlar. Kıskanmam mı gerekiyor?', 'İlişki', 60, 654, 321, 'tr', 'jealous_or_careful');

-- 11. love_bomb - Red flag detection
INSERT INTO confessions (content, category, toxic_score, like_count, dislike_count, locale, vote_type) VALUES
('Tanıştıktan 2 hafta sonra "Seni seviyorum" dedi

Tinder''dan tanıştık, 4 kez görüştük. Dün "Hayatımın aşkısın, seninle evlenmek istiyorum" dedi. Çok romantik ama bu normal mi? Yoksa red flag mı?', 'Flört', 75, 987, 123, 'tr', 'love_bomb');

-- 12. gaslight - Manipulation
INSERT INTO confessions (content, category, toxic_score, like_count, dislike_count, locale, vote_type) VALUES
('Sevgilim "O konuşma hiç olmadı" diyor ama net hatırlıyorum

Geçen hafta tartıştık, ayrılmaktan bahsetti. Bugün sorduğumda "Ne konuşması? Asla öyle bir şey demedim, hayal görüyorsun" dedi. Deliriyor muyum?', 'Toksik', 90, 1456, 89, 'tr', 'gaslight');

-- More viral debates for engagement

INSERT INTO confessions (content, category, toxic_score, like_count, dislike_count, locale, vote_type) VALUES
('Flörtümün evindeydim, eski sevgilisinden eşyalar gördüm

Banyoda kadın şampuanı, dolapta kadın terlikleri var. Sorduğumda "Kız kardeşimden kalma" dedi ama kız kardeşi yok...', 'Flört', 88, 1789, 234, 'tr', 'red_flag');

INSERT INTO confessions (content, category, toxic_score, like_count, dislike_count, locale, vote_type) VALUES
('Teklif ettim "Düşüneceğim" dedi 1 haftadır cevap yok

2 yıllık arkadaşımc, geçen hafta hislerimi açıkladım. "Düşüneceğim" dedi ama 1 haftadır tek kelime etmiyor. Arkadaşlık da gitti mi?', 'Flört', 55, 543, 432, 'tr', 'talk_or_ignore');

INSERT INTO confessions (content, category, toxic_score, like_count, dislike_count, locale, vote_type) VALUES
('Nişanlım düğünden 1 ay önce "Emin değilim" dedi

Mekan tutuldu, davetiyeler basıldı, her şey hazır. Dün gece "Acele mi ettik acaba?" dedi. 100 kişilik düğün var, ne yapacağım?', 'İlişki', 70, 2341, 456, 'tr', 'stay_or_leave');

INSERT INTO confessions (content, category, toxic_score, like_count, dislike_count, locale, vote_type) VALUES
('Aldatıldığımı öğrendim ama çocuğumuz var

4 yaşında oğlumuz var. Telefonunda mesajları gördüm, 6 aydır başka biriyle berabermiş. Çocuk için katlanmalı mıyın?', 'Toksik', 95, 3456, 234, 'tr', 'stay_or_leave');

INSERT INTO confessions (content, category, toxic_score, like_count, dislike_count, locale, vote_type) VALUES
('Sevgilim erkek arkadaşlarımla takılmamı istemiyor

"Güvenmiyorum" değil "Onlar sana bakıyor" diyor. 10 yıllık arkadaşlarım bunlar. Kısıtlama mı yoksa koruma mı?', 'Toksik', 72, 1234, 567, 'tr', 'set_boundary');

INSERT INTO confessions (content, category, toxic_score, like_count, dislike_count, locale, vote_type) VALUES
('Ex''im yeni sevgilisinin Instagram''da beni stalklıyor

Her story''ye bakıyor, yorum yapmıyor ama tüm paylaşımlarıma bakıyor. Ex''im mi yaptırıyor yoksa o mu merak ediyor?', 'Ex', 50, 876, 234, 'tr', 'suspicious');

INSERT INTO confessions (content, category, toxic_score, like_count, dislike_count, locale, vote_type) VALUES
('Evlilik teklifi için 5 yıl bekledim hala yok

5 yıllık sevgilim, beraber yaşıyoruz, "evlenmek şart mı ki?" diyor. 30 yaşına geldim, beklemeli miyim?', 'İlişki', 45, 2134, 432, 'tr', 'stay_or_leave');

INSERT INTO confessions (content, category, toxic_score, like_count, dislike_count, locale, vote_type) VALUES
('Sevgilim her tartışmada "Ayrılalım" diyor

En ufak şeyde "Tamam o zaman ayrılalım" diyor. Sonra özür diliyor. Bu manipülasyon mu?', 'Toksik', 82, 1876, 321, 'tr', 'gaslight');
