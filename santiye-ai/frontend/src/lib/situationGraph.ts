export type ScenarioStep = {
    id: string;
    label: string;
    emoji: string;
    next?: ScenarioStep[]; // The "Next Token" prediction
    prompt?: string; // Fallback prompt
    promptKey?: string; // i18n Key for the prompt (e.g., 'ex_wrote_late')
};


export const PREDICTION_GRAPH: ScenarioStep[] = [
    {
        id: "ex",
        label: "Ex Sevgilim",
        emoji: "💔",
        next: [
            {
                id: "wrote",
                label: "Mesaj Attı",
                emoji: "📩",
                next: [
                    { id: "late", label: "Gece 3'te", emoji: "🌙", promptKey: "ex_wrote_late", prompt: "Ex sevgilim gece 3'te mesaj attı. Bu saatte yazmasının bilinçaltı sebebi ne?" },
                    { id: "casual", label: "Hiçbir şey yokmuş gibi", emoji: "😐", promptKey: "ex_wrote_casual", prompt: "Ex sevgilim sanki hiç ayrılmamışız gibi normal bir mesaj attı. Amacı ne?" },
                    { id: "regret", label: "Özledim dedi", emoji: "🥺", promptKey: "ex_wrote_regret", prompt: "Ex sevgilim açıkça 'özledim' yazdı. Bu bir tuzak mı yoksa gerçek mi?" },
                    { id: "drunk", label: "Sarhoşken", emoji: "🍷", promptKey: "ex_wrote_drunk", prompt: "Ex sevgilim sarhoşken saçma sapan mesajlar attı. Sabah pişman olur mu?" },
                    { id: "oldpic", label: "Eski Fotoğraf Attı", emoji: "📸", promptKey: "ex_wrote_oldpic", prompt: "Ex sevgilim ilişkimizden kalma eski bir fotoğrafımızı attı. Duygusal manipülasyon mu?" }
                ]
            },
            {
                id: "story",
                label: "Story/Beğeni",
                emoji: "👀",
                next: [
                    { id: "fast", label: "Hemen İzledi", emoji: "⚡", promptKey: "ex_story_fast", prompt: "Story atar atmaz ex sevgilim görüntüledi. Bildirimleri mi açık?" },
                    { id: "fake", label: "Fake Hesap", emoji: "🕵️", promptKey: "ex_story_fake", prompt: "Ex sevgilimin fake hesabından storyme baktığını düşünüyorum. Neden saklanıyor?" },
                    { id: "reply", label: "Alev Attı", emoji: "🔥", promptKey: "ex_story_reply", prompt: "Ex sevgilim storyme alev emojisi attı. Bu bir 'dön' çağrısı mı?" },
                    { id: "like", label: "Eski Foto Beğendi", emoji: "❤️", promptKey: "ex_story_like", prompt: "Ex sevgilim çok eski bir fotoğrafımı beğendi (Stalk). Amacı ne?" }
                ]
            },
            {
                id: "behavior",
                label: "Garip Davranıyor",
                emoji: "🤔",
                next: [
                    { id: "blocked", label: "Durduk Yere Engelledi", emoji: "🚫", promptKey: "ex_behavior_blocked", prompt: "Ex sevgilim hiçbir sebep yokken beni her yerden engelledi. Neden?" },
                    { id: "jealous", label: "Kıskandırmaya Çalışıyor", emoji: "💅", promptKey: "ex_behavior_jealous", prompt: "Ex sevgilim sürekli başkalarıyla eğlendiğini gösteren paylaşımlar yapıyor. Nispet mi?" },
                    { id: "friend", label: "Arkadaş Kalalım Dedi", emoji: "🤝", promptKey: "ex_behavior_friend", prompt: "Ex sevgilim 'arkadaş kalalım' diye tutturdu. Beni yedekte mi tutuyor?" }
                ]
            }
        ]
    },
    {
        id: "flirt",
        label: "Flört / Konuşuyoruz",
        emoji: "😏",
        next: [
            {
                id: "comm",
                label: "İletişim Sorunu",
                emoji: "📡",
                next: [
                    { id: "late", label: "Çok Geç Yazıyor", emoji: "⏳", promptKey: "flirt_comm_late", prompt: "Flörtüm sürekli saatler sonra cevap veriyor ama online." },
                    { id: "dry", label: "Soğuk Yapıyor", emoji: "❄️", promptKey: "flirt_comm_dry", prompt: "Flörtümün mesajları son zamanlarda kısaldı ve soğudu. İlgisi bitti mi?" },
                    { id: "ghost", label: "Ghostladı", emoji: "👻", promptKey: "flirt_comm_ghost", prompt: "Flörtüm aniden mesaj atmayı kesti (Ghosting). Sebebi ne olabilir?" },
                    { id: "seen", label: "Görüldü Attı", emoji: "👁️", promptKey: "flirt_comm_seen", prompt: "Mesajımı gördü ama cevap vermedi. Üstüne yazmalı mıyım?" }
                ]
            },
            {
                id: "date",
                label: "Buluşma Durumu",
                emoji: "🥂",
                next: [
                    { id: "ask", label: "Buluşma Teklif Etmiyor", emoji: "📅", promptKey: "flirt_date_ask", prompt: "Sürekli konuşuyoruz ama bir türlü buluşma teklif etmiyor. Sanal mı takılıyor?" },
                    { id: "cancel", label: "Son Dakika İptal", emoji: "❌", promptKey: "flirt_date_cancel", prompt: "Buluşmamızı son dakika bahane uydurup iptal etti. Yalan mı söylüyor?" },
                    { id: "home", label: "Eve Çağırdı", emoji: "🏠", promptKey: "flirt_date_home", prompt: "İlk buluşmalarda beni hemen evine çağırdı. Niyeti sadece cinsellik mi?" }
                ]
            },
            {
                id: "mixed",
                label: "Karışık Sinyaller",
                emoji: "🌀",
                next: [
                    { id: "lovebomb", label: "Çok Hızlı İlerliyor", emoji: "🚀", promptKey: "flirt_mixed_lovebomb", prompt: "Daha yeni tanıştık ama bana aşıkmış gibi davranıyor (Love Bombing). Güvenmeli miyim?" },
                    { id: "ex_talk", label: "Ex'inden Bahsediyor", emoji: "🗣️", promptKey: "flirt_mixed_extalk", prompt: "Sürekli eski sevgilisinden bahsediyor. Beni yara bandı olarak mı görüyor?" }
                ]
            }
        ]
    },
    {
        id: "crush",
        label: "Platonik / Hoşlanıyorum",
        emoji: "🥰",
        next: [
            {
                id: "interaction",
                label: "Etkileşim Var",
                emoji: "✨",
                next: [
                    { id: "eye", label: "Göz Teması Kuruyor", emoji: "👀", promptKey: "crush_interaction_eye", prompt: "Platonik hoşlandığım kişi benimle sık sık göz teması kuruyor. Benden hoşlanıyor mu?" },
                    { id: "story_reply", label: "Storyme Yanıt Verdi", emoji: "💬", promptKey: "crush_interaction_story", prompt: "Platonik aşkım storyme yanıt verdi. Sohbeti nasıl devam ettirmeliyim?" },
                    { id: "close", label: "Yakın Davranıyor", emoji: "🤗", promptKey: "crush_interaction_close", prompt: "Bana fiziksel olarak yakın duruyor ve temas ediyor. Arkadaşça mı flört mü?" }
                ]
            },
            {
                id: "friendzone",
                label: "Friendzone Şüphesi",
                emoji: "🚧",
                next: [
                    { id: "bro", label: "Kanka/Reis Diyor", emoji: "🤜", promptKey: "crush_friendzone_bro", prompt: "Hoşlandığım kişi bana 'kanka', 'kardeşim' diyor. Friendzone'dan nasıl çıkarım?" },
                    { id: "others", label: "Başkalarını Anlatıyor", emoji: "🤷", promptKey: "crush_friendzone_others", prompt: "Yanımda başkalarından hoşlandığını anlatıyor. Beni dost olarak mı görüyor?" }
                ]
            }
        ]
    },
    {
        id: "partner",
        label: "Sevgilim / Eşim",
        emoji: "💍",
        next: [
            {
                id: "trust",
                label: "Güven Sorunu",
                emoji: "🤥",
                next: [
                    { id: "phone", label: "Telefonunu Saklıyor", emoji: "📱", promptKey: "partner_trust_phone", prompt: "Sevgilim telefonunu benden köşe bucak saklıyor. Aldatıyor olabilir mi?" },
                    { id: "lie", label: "Yalanını Yakaladım", emoji: "🤥", promptKey: "partner_trust_lie", prompt: "Sevgilimin ufak bir yalanını yakaladım. Başka şeyler de saklıyor mudur?" },
                    { id: "online", label: "Çevrimiçi Takibi", emoji: "🟢", promptKey: "partner_trust_online", prompt: "Gece geç saatlerde çevrimiçi oluyor ama bana yazmıyor. Kiminle konuşuyor?" }
                ]
            },
            {
                id: "fight",
                label: "Tartışma",
                emoji: "⚔️",
                next: [
                    { id: "silent", label: "Küstü/Konuşmuyor", emoji: "😶", promptKey: "partner_fight_silent", prompt: "Kavgadan sonra günlerdir 'Silent Treatment' (sessiz muamele) uyguluyor. Ne yapmalıyım?" },
                    { id: "disrespect", label: "Saygısızlaştı", emoji: "🤬", promptKey: "partner_fight_disrespect", prompt: "Kavga ederken bana hakaret etti ve saygısızca davrandı. Bu ilişki toksikleşti mi?" }
                ]
            }
        ]
    }
];

export const FLIRT_GRAPH: ScenarioStep[] = [
    {
        id: "opening",
        label: "Tanışma / İlk Mesaj",
        emoji: "👋",
        next: [
            {
                id: "insta_dm",
                label: "Insta DM",
                emoji: "📸",
                next: [
                    { id: "story_reply", label: "Story'ye Yanıt", emoji: "💬", promptKey: "open_insta_story", prompt: "Story'sine yanıt vererek dm kutusuna düşmek istiyorum. Ne yazmalıyım?" },
                    { id: "cold_dm", label: "Direkt DM", emoji: "📨", promptKey: "open_insta_cold", prompt: "Hiç konuşmadık, direkt DM atmak istiyorum. Dikkat çekici ne yazabilirim?" },
                    { id: "note", label: "Not Bırakma", emoji: "📝", promptKey: "open_insta_note", prompt: "Instagram notlarına ilgisini çekecek ne yazabilirim?" }
                ]
            },
            {
                id: "app",
                label: "Dating App",
                emoji: "🔥",
                next: [
                    { id: "match_open", label: "Eşleşme Açılışı", emoji: "✨", promptKey: "open_app_match", prompt: "Tinder/Bumble'da eşleştik. 'Selam' yazmak istemiyorum, yaratıcı bir açılış ver." },
                    { id: "bio", label: "Bio Yorumu", emoji: "📝", promptKey: "open_app_bio", prompt: "Bio'sunda yazan bir şeye gönderme yaparak girmek istiyorum. Öneri ver." }
                ]
            },
            {
                id: "real_life",
                label: "Gerçek Hayat",
                emoji: "👀",
                next: [
                    { id: "gym", label: "Spor Salonu", emoji: "💪", promptKey: "open_real_gym", prompt: "Spor salonunda gördüğüm biriyle tanışmak istiyorum. Rahatsız etmeden nasıl yaklaşırım?" },
                    { id: "cafe", label: "Kafe/Bar", emoji: "☕", promptKey: "open_real_cafe", prompt: "Kafede/Barda yan masadaki kişiyle tanışmak istiyorum. Doğal bir bahane ver." }
                ]
            }
        ]
    },
    {
        id: "reply_game",
        label: "Cevap Verme Oyunu",
        emoji: "🎮",
        next: [
            {
                id: "ghost_revive",
                label: "Ghosting'i Boz",
                emoji: "👻",
                next: [
                    { id: "funny", label: "Komik/Meme", emoji: "😂", promptKey: "reply_ghost_funny", prompt: "Ghostlayan flörte komik veya meme tarzı bir mesaj atıp cevap almak istiyorum." },
                    { id: "provoke", label: "Ters Köşe", emoji: "😈", promptKey: "reply_ghost_provoke", prompt: "Ghostlayan kişiyi biraz kışkırtacak (neg) bir mesaj öner." }
                ]
            },
            {
                id: "dry_text",
                label: "Kuru Mesajı Canlandır",
                emoji: "🌵",
                next: [
                    { id: "topic", label: "Konu Değiştir", emoji: "🔀", promptKey: "reply_dry_topic", prompt: "Sohbet tıkandı, sadece 'aynen' yazdı. Konuyu değiştirecek ilginç bir soru ver." },
                    { id: "flirty", label: "Flörte Çevir", emoji: "😏", promptKey: "reply_dry_flirty", prompt: "Sıkıcı akan sohbeti bir anda flörtöz ve heyecanlı hale getirmek istiyorum." }
                ]
            },
            {
                id: "turn_down",
                label: "Reddet / Sınır Çiz",
                emoji: "✋",
                next: [
                    { id: "soft", label: "Kibarca Reddet", emoji: "🙂", promptKey: "reply_reject_soft", prompt: "Buluşmak istiyor ama ben istemiyorum. Kırmadan nasıl reddederim?" },
                    { id: "hard", label: "Toksikliği Bitir", emoji: "🛑", promptKey: "reply_reject_hard", prompt: "Bana saygısızlık yaptı. Ona haddini bildiren kapak bir cevap ver." }
                ]
            }
        ]
    },
    {
        id: "date",
        label: "Buluşma Taktikleri",
        emoji: "🥂",
        next: [
            {
                id: "asking",
                label: "Dışarı Çağır",
                emoji: "📅",
                next: [
                    { id: "casual", label: "Kahve/Drink", emoji: "☕", promptKey: "date_ask_casual", prompt: "Onu kahve içmeye veya bir şeyler içmeye çağırmak istiyorum. Rahat (non-needy) bir mesaj öner." },
                    { id: "creative", label: "Yaratıcı Davet", emoji: "🎨", promptKey: "date_ask_creative", prompt: "Klasik yemek/sinema dışında yaratıcı bir date fikri ile davet et." }
                ]
            },
            {
                id: "after_date",
                label: "Buluşma Sonrası",
                emoji: "🏠",
                next: [
                    { id: "good", label: "İyi Geçti", emoji: "✨", promptKey: "date_after_good", prompt: "Buluşma harika geçti. Eve varınca ne yazmalıyım? (Çok hevesli görünmeden)." },
                    { id: "bad", label: "Kötü Geçti", emoji: "😬", promptKey: "date_after_bad", prompt: "Buluşma kötüydü, elektrik alamadım. İletişimi nasıl kesmeliyim?" }
                ]
            }
        ]
    }
];
