import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { PersonaType } from "@/lib/personas";

interface QuickChipsProps {
    onSelect: (text: string) => void;
    disabled?: boolean;
    persona: PersonaType;
}

const CHIPS_BY_PERSONA: Record<PersonaType, { label: string; prompt: string }[]> = {
    dedektif: [
        { label: "🚩 Risk Analizi Yap", prompt: "Bu konuşmadaki riskleri yüzde vererek analiz et." },
        { label: "👻 Ghosting mi?", prompt: "Beni ghostluyor mu? Davranışlarını analiz et." },
        { label: "💔 Ayrılmalı mıyım?", prompt: "İlişkimizdeki kırmızı bayrakları listele ve ayrılmalı mıyım söyle." },
        { label: "🔍 Mesajı Çözümle", prompt: "Bu mesajın alt metninde ne demek istiyor?" },
        { label: "🦋 Hoşlanıyor mu?", prompt: "Benden hoşlandığına dair işaretler var mı?" },
        { label: "🤡 Manipülasyon mu?", prompt: "Bana manipülasyon veya gaslighting yapıyor mu?" },
    ],
    taktik: [
        { label: "🧊 Soğuk Yapma Taktikleri", prompt: "Ona nasıl cool ve umursamaz davranabilirim? Taktik ver." },
        { label: "🔥 Flörtü Arttır", prompt: "Adrenalini yükseltecek flörtöz bir mesaj önerisi ver." },
        { label: "💀 Ghost'a Cevap", prompt: "Beni ghostlayıp aylar sonra yazan birine ne yazmalıyım? Toksik olsun." },
        { label: "📸 Story Yanıtı", prompt: "Storysine alev attıracak zekice bir yanıt öner." },
        { label: "😈 Ex'i Kudurt", prompt: "Eski sevgilimi kıskandıracak ince bir mesaj taktiği ver." },
        { label: "👀 İlk Mesaj (Açılış)", prompt: "Selam yazmadan dikkat çekecek yaratıcı bir açılış cümlesi ver." },
    ]
};

export default function QuickChips({ onSelect, disabled, persona }: QuickChipsProps) {
    const chips = CHIPS_BY_PERSONA[persona] || CHIPS_BY_PERSONA['dedektif'];

    return (
        <div className="w-full py-2 px-2">
            <div className="flex flex-wrap gap-2 justify-center">
                {chips.map((chip, index) => (
                    <motion.button
                        key={chip.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => !disabled && onSelect(chip.prompt)}
                        className={cn(
                            "flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-colors border text-center flex-grow sm:flex-grow-0",
                            "bg-zinc-900/80 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-600",
                            disabled && "opacity-50 cursor-not-allowed",
                            persona === 'taktik' && "hover:border-indigo-500 hover:text-indigo-400"
                        )}
                    >
                        {chip.label}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
