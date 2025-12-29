"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Heart, Flame, Skull, AlertOctagon, HelpCircle, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { VOTE_TYPES } from "@/lib/voteTypes";

// Map categories to appropriate vote types
const CATEGORY_VOTE_MAP: Record<string, string[]> = {
    "İlişki": ["red_flag", "stay_or_leave", "toxic_or_valid", "set_boundary"],
    "Flört": ["text_or_not", "talk_or_ignore", "overreacting", "jealous_or_careful"],
    "Ex": ["text_or_not", "stay_or_leave", "overreacting", "suspicious"],
    "Toksik": ["red_flag", "gaslight", "love_bomb", "set_boundary"],
    "Diğer": ["toxic_or_valid", "overreacting", "suspicious", "talk_or_ignore"]
};

// Get a random vote type for a category
const getRandomVoteTypeForCategory = (category: string): string => {
    const types = CATEGORY_VOTE_MAP[category] || CATEGORY_VOTE_MAP["Diğer"];
    return types[Math.floor(Math.random() * types.length)];
};

interface CreateConfessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    defaultContent?: string;
    defaultTitle?: string;
}

// Clickbait hook templates for different categories
const HOOK_TEMPLATES = {
    tr: {
        "İlişki": [
            "3 yıllık sevgilim bunu yaptı ve...",
            "Sevgilime güvendim ama...",
            "Bu mesajı gördükten sonra...",
            "Herkes 'Mükemmel çift' diyordu ama...",
            "Aile toplantısında olan şey...",
        ],
        "Flört": [
            "İlk buluşmada söylediği şey...",
            "DM'den gelen bu mesaj...",
            "Arkadaşımın crush'ı ile olan olay...",
            "Bu emoji'yi attı ve sonra...",
            "Görüldü attı ama...",
        ],
        "Ex": [
            "Eski sevgilim 2 yıl sonra yazdı...",
            "Ayrıldıktan 1 hafta sonra öğrendiğim...",
            "Arkadaşlarından duyduğum şok gerçek...",
            "Sosyal medyada gördüğüm fotoğraf...",
            "Ortak arkadaşımız itiraf etti ki...",
        ],
        "Toksik": [
            "Bunları söylerse KAAAAÇ 🚩",
            "Hala bunu yapıyorsa red flag...",
            "Manipülasyonun kitabını yazdı...",
            "Gaslighting'in son noktası...",
            "Herkes uyardı ama dinlemedim...",
        ],
        "Diğer": [
            "Kimseye anlatamadım ama...",
            "Bunu ilk kez paylaşıyorum...",
            "Jüri karar versin...",
            "Haklı mıyım haksız mıyım?",
            "Bu durumda ne yapardınız?",
        ]
    },
    en: {
        "İlişki": [
            "My partner of 3 years did this and...",
            "I trusted them but then...",
            "After seeing this message...",
            "Everyone said we were 'perfect' but...",
            "What happened at the family dinner...",
        ],
        "Flört": [
            "What they said on the first date...",
            "This DM I received...",
            "The situation with my friend's crush...",
            "They sent this emoji and then...",
            "Left me on read but...",
        ],
        "Ex": [
            "My ex texted 2 years later...",
            "What I found out 1 week after breakup...",
            "The shocking truth from mutual friends...",
            "That photo I saw on social media...",
            "Our mutual friend confessed that...",
        ],
        "Toksik": [
            "If they say this, RUN 🚩",
            "Major red flag if they still do this...",
            "The textbook definition of manipulation...",
            "Peak gaslighting behavior...",
            "Everyone warned me but I didn't listen...",
        ],
        "Diğer": [
            "I've never told anyone but...",
            "Sharing this for the first time...",
            "Let the jury decide...",
            "Am I right or wrong here?",
            "What would you do?",
        ]
    }
};

type CategoryKey = "İlişki" | "Flört" | "Ex" | "Toksik" | "Diğer";

export default function CreateConfessionModal({ isOpen, onClose, onSuccess, defaultContent = "", defaultTitle = "" }: CreateConfessionModalProps) {
    const t = useTranslations('jury_modal');
    const tCat = useTranslations('categories');
    const locale = useLocale();

    // Categories definition inside component to use hooks
    const CATEGORIES = [
        { id: "İlişki", label: tCat('relation'), icon: Heart, color: "text-rose-400" },
        { id: "Flört", label: tCat('flirt'), icon: Flame, color: "text-orange-400" },
        { id: "Ex", label: tCat('ex'), icon: Skull, color: "text-zinc-400" },
        { id: "Toksik", label: tCat('toxic'), icon: AlertOctagon, color: "text-red-500" },
        { id: "Diğer", label: tCat('other'), icon: HelpCircle, color: "text-blue-400" }
    ];

    const [title, setTitle] = useState(defaultTitle);
    const [content, setContent] = useState(defaultContent);
    const [selectedCategory, setSelectedCategory] = useState("İlişki");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGeneratingHook, setIsGeneratingHook] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTitle(defaultTitle);
            setContent(defaultContent);
        }
    }, [isOpen, defaultTitle, defaultContent]);

    // Generate a random clickbait hook based on category
    const generateClickbaitHook = () => {
        setIsGeneratingHook(true);

        // Simulate AI thinking for UX
        setTimeout(() => {
            const localeKey = locale as 'tr' | 'en';
            const categoryKey = selectedCategory as CategoryKey;
            const templates = HOOK_TEMPLATES[localeKey]?.[categoryKey] || HOOK_TEMPLATES.tr[categoryKey];
            const randomHook = templates[Math.floor(Math.random() * templates.length)];
            setTitle(randomHook);
            setIsGeneratingHook(false);
        }, 500);
    };

    const handleSubmit = async () => {
        if (!content.trim() || !title.trim() || isSubmitting) return;

        // Validation for length (Must match DB constraint > 10 chars)
        if (content.trim().length <= 10) {
            alert("Min 10 chars required.");
            return;
        }

        setIsSubmitting(true);
        try {
            const fullContent = `${title.trim()}\n\n${content.trim()}`;
            const voteType = getRandomVoteTypeForCategory(selectedCategory);

            const { error, data } = await supabase
                .from("confessions")
                .insert([{
                    content: fullContent,
                    category: selectedCategory,
                    toxic_score: 0,
                    locale: locale,
                    vote_type: voteType
                }])
                .select();

            if (error) throw error;

            setContent("");
            setTitle("");
            setSelectedCategory("İlişki");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Error submitting confession:", error);
            alert(`Error: ${error.message || "Unknown error"}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-[100] px-4"
                    >
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                            {/* Glow Effect */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full pointing-events-none" />

                            <div className="flex items-center justify-between mb-6 relative z-10">
                                <h2 className="text-xl font-bold text-white tracking-wide">{t('title')}</h2>
                                <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Category Selection */}
                            <div className="mb-5">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">
                                    {t('topic_label')}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => {
                                                setSelectedCategory(cat.id);
                                                // Auto-generate new hook when category changes
                                                const catKey = selectedCategory as CategoryKey;
                                                if (title === "" || HOOK_TEMPLATES.tr[catKey]?.includes(title) ||
                                                    HOOK_TEMPLATES.en[catKey]?.includes(title)) {
                                                    setTimeout(() => generateClickbaitHook(), 100);
                                                }
                                            }}
                                            className={cn(
                                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border",
                                                selectedCategory === cat.id
                                                    ? "bg-zinc-800 border-zinc-600 text-white shadow-lg scale-105"
                                                    : "bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400"
                                            )}
                                        >
                                            <cat.icon size={12} className={selectedCategory === cat.id ? cat.color : ""} />
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Title Input with AI Generate Button */}
                            <div className="mb-4">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder={t('placeholder_title')}
                                        className="flex-1 bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:font-normal"
                                    />
                                    <button
                                        onClick={generateClickbaitHook}
                                        disabled={isGeneratingHook}
                                        className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl transition-all active:scale-95 disabled:opacity-70 flex items-center gap-1 text-xs font-bold shadow-lg"
                                        title="Generate clickbait hook"
                                    >
                                        {isGeneratingHook ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <>
                                                <Sparkles size={14} />
                                                AI
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder={t('placeholder_content')}
                                className="w-full h-32 bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none mb-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent text-sm leading-relaxed"
                            />

                            <div className="flex justify-between items-center gap-3">
                                <span className="text-[10px] text-zinc-600 font-medium px-1">
                                    {t('anon_hint')}
                                </span>
                                <div className="flex gap-3">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!content.trim() || !title.trim() || isSubmitting}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-indigo-500/20"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                <span>{locale === 'tr' ? 'Gönderiliyor...' : 'Sending...'}</span>
                                            </>
                                        ) : (
                                            <>
                                                {t('submit')}
                                                <Send size={14} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
