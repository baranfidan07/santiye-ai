"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PREDICTION_GRAPH, ScenarioStep } from "@/lib/situationGraph";
import { RefreshCcw, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface SituationWizardProps {
    onComplete: (prompt: string) => void;
    onReset?: () => void;
    graph?: ScenarioStep[];
    compact?: boolean;
    onDismiss?: () => void;
    inputText?: string;
}

export default function SituationWizard({ onComplete, onReset, graph, compact = false, onDismiss, inputText }: SituationWizardProps) {
    const t = useTranslations('wizard');
    const [history, setHistory] = useState<ScenarioStep[]>([]);
    const [currentOptions, setCurrentOptions] = useState<ScenarioStep[]>(graph || PREDICTION_GRAPH);

    const handleSelect = (option: ScenarioStep) => {
        const newHistory = [...history, option];

        if (option.next && option.next.length > 0) {
            setHistory(newHistory);
            setCurrentOptions(option.next);
        } else {
            onComplete(option.promptKey || option.prompt || "");
        }
    };

    const handleReset = () => {
        setHistory([]);
        setCurrentOptions(graph || PREDICTION_GRAPH);
        if (onReset) onReset();
    };

    // Compact mobile mode - wrapped chips with keyword filtering
    if (compact) {
        // Filter/prioritize based on input text
        let displayOptions = currentOptions;
        if (inputText && inputText.length > 1) {
            const lower = inputText.toLowerCase();
            const keywordMap: Record<string, string[]> = {
                'ex': ['eski', 'ex', 'ayrıl', 'bitti', 'terk'],
                'crush': ['hoşlan', 'beğen', 'aşık', 'çekici', 'ilgi'],
                'partner': ['sevgili', 'partner', 'ilişki', 'birlikte'],
                'flirt': ['flört', 'yeni', 'tanış', 'match'],
                'friend': ['arkadaş', 'friend', 'zone', 'dost'],
                'ghosted': ['ghost', 'cevap', 'yazmıyor', 'görüldü', 'mavi tik'],
                'mixed': ['karışık', 'anlamıyor', 'belirsiz', 'sinyal'],
                'first': ['ilk', 'başla', 'aç', 'nasıl yaz'],
            };
            const matches = currentOptions.filter(opt => {
                const keywords = keywordMap[opt.id] || [];
                return keywords.some(kw => lower.includes(kw)) ||
                    opt.label.toLowerCase().includes(lower);
            });
            if (matches.length > 0) {
                const others = currentOptions.filter(opt => !matches.includes(opt));
                displayOptions = [...matches, ...others];
            }
        }

        return (
            <div className="w-full border-t bg-zinc-900/90 border-zinc-800">
                <div className="flex items-start gap-2 px-2 py-2">
                    {history.length > 0 && (
                        <button
                            onClick={handleReset}
                            className="shrink-0 p-1.5 transition-colors mt-0.5 text-zinc-500 hover:text-white"
                        >
                            <RefreshCcw size={14} />
                        </button>
                    )}
                    <div className="flex-1 flex flex-wrap gap-1.5">
                        {displayOptions.map((option, idx) => (
                            <button
                                key={option.id}
                                onClick={() => handleSelect(option)}
                                className={cn(
                                    "flex items-center gap-1 px-2.5 py-1.5 border rounded-full text-xs font-medium transition-all active:scale-95",
                                    idx === 0 && inputText && inputText.length > 1
                                        ? "bg-indigo-500 border-indigo-400 text-white"
                                        : "bg-zinc-800 hover:bg-indigo-600 border-zinc-700 hover:border-indigo-500 text-zinc-300 hover:text-white"
                                )}
                            >
                                <span>{option.emoji}</span>
                                <span>{t(option.label as any) === `wizard.${option.label}` ? option.label : t(option.label as any)}</span>
                            </button>
                        ))}
                    </div>
                    {onDismiss && (
                        <button
                            onClick={onDismiss}
                            className="shrink-0 p-1.5 text-zinc-500 hover:text-white transition-colors mt-0.5"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Default full mode
    return (
        <div className="w-full max-w-sm mx-auto mb-2">
            <div className="bg-zinc-900/40 backdrop-blur-md rounded-xl border border-white/5 p-2 sm:p-3 relative overflow-hidden">

                {/* Header / Breadcrumbs */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-400">
                        <span className={cn(history.length === 0 ? "text-indigo-400" : "")}>{t('who')}</span>
                        {history.length > 0 && <ChevronRight size={10} />}
                        <span className={cn(history.length === 1 ? "text-indigo-400" : "")}>{t('action')}</span>
                        {history.length > 1 && <ChevronRight size={10} />}
                        <span className={cn(history.length === 2 ? "text-indigo-400" : "")}>{t('detail')}</span>
                    </div>

                    {history.length > 0 && (
                        <button
                            onClick={handleReset}
                            className="text-zinc-500 hover:text-white transition-colors"
                        >
                            <RefreshCcw size={12} />
                        </button>
                    )}
                </div>

                {/* Options Grid */}
                <motion.div
                    layout
                    className="flex flex-wrap gap-1.5 justify-center"
                >
                    <AnimatePresence mode="popLayout">
                        {currentOptions.map((option, i) => (
                            <motion.button
                                key={option.id}
                                layoutId={`option-${option.id}`}
                                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 25,
                                    delay: i * 0.03
                                }}
                                onClick={() => handleSelect(option)}
                                className="group relative flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-800/80 hover:bg-indigo-600/90 border border-white/5 hover:border-indigo-500/50 rounded-lg transition-all shadow-md active:scale-95 text-left"
                            >
                                <span className="text-base group-hover:scale-110 transition-transform duration-300">{option.emoji}</span>
                                <span className="text-xs font-medium text-zinc-200 group-hover:text-white">
                                    {t(option.label as any) === `wizard.${option.label}` ? option.label : t(option.label as any)}
                                </span>
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </motion.div>

            </div>
        </div>
    );
}
