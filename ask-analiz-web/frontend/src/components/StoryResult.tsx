"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface StoryResultProps {
    result: {
        headline: string; // Emoji + One liner
        bullets: string[];
        advice: string;
        riskScore: number;
        replies?: string[];
    } | null;
    onClose: () => void;
    onShare?: () => void; // Optional share handler
}

export default function StoryResult({ result, onClose, onShare }: StoryResultProps) {
    const [step, setStep] = useState(0);

    if (!result) return null;

    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
        if (navigator.vibrate) navigator.vibrate(50);
    };

    const cards = [
        // Card 1: Vibe Check
        <div key="vibe" className="flex flex-col items-center justify-center text-center h-full p-6">
            <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                className="text-8xl mb-6 drop-shadow-2xl"
            >
                {/* Extract emoji from headline or default */}
                {result.headline.match(/[\u{1F300}-\u{1F9FF}]/gu)?.[0] || "🧐"}
            </motion.div>
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-indigo-500 mb-4">
                {result.headline.replace(/[\u{1F300}-\u{1F9FF}]/gu, '')}
            </h2>
            <p className="text-zinc-400 text-sm uppercase tracking-widest">Durum Analizi</p>
        </div>,

        // Card 2: Red Flags OR Rizz Replies
        <div key="facts" className="flex flex-col items-center justify-center p-6 h-full">
            <h3 className="text-xl font-bold text-white mb-6 border-b border-zinc-700 pb-2 w-full text-center">
                {(result as any).replies ? "💬 Seç ve Kopyala" : "🔍 Tespitler"}
            </h3>

            <ul className="space-y-3 w-full text-left">
                {((result as any).replies || result.bullets).map((item: string, i: number) => (
                    <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        {(result as any).replies ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleCopy(item.replace(/^\d+\.\s.*?:\s/, ''), i); }}
                                className="w-full text-left flex flex-col bg-zinc-800 p-4 rounded-xl border border-zinc-700 hover:bg-zinc-700 active:scale-95 transition-all relative overflow-hidden"
                            >
                                <span className="text-xs font-bold text-indigo-400 mb-1">
                                    {item.split(":")[0]}
                                </span>
                                <span className={cn(
                                    "text-zinc-100 text-sm font-medium",
                                    copiedIndex === i && "text-green-400"
                                )}>
                                    {copiedIndex === i ? "Kopyalandı! ✅" : item.replace(/^\d+\.\s.*?:\s/, '')}
                                </span>
                            </button>
                        ) : (
                            <div className="flex items-start bg-zinc-800/50 p-3 rounded-lg border border-zinc-700">
                                <span className="mr-3 text-lg">🚩</span>
                                <span className="text-zinc-200 text-sm font-medium">{item}</span>
                            </div>
                        )}
                    </motion.li>
                ))}
            </ul>
        </div>,

        // Card 3: Verdict
        <div key="verdict" className="flex flex-col items-center p-6 pt-12 text-center h-full w-full">
            <div className="relative w-32 h-32 flex items-center justify-center mb-4 shrink-0">
                <svg className="absolute w-full h-full rotate-[-90deg]">
                    <circle cx="64" cy="64" r="56" stroke="#3f3f46" strokeWidth="8" fill="none" />
                    <circle
                        cx="64" cy="64" r="56"
                        stroke={result.riskScore > 70 ? "#ef4444" : result.riskScore > 40 ? "#eab308" : "#22c55e"}
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray="351"
                        strokeDashoffset={351 - (351 * result.riskScore) / 100}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="flex flex-col items-center z-10">
                    <span className="text-3xl font-black text-white">{result.riskScore}%</span>
                    <span className="text-[10px] text-zinc-500 uppercase">Risk</span>
                </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-4 shrink-0">Sonuç</h3>

            <div className="flex-1 w-full overflow-y-auto min-h-0 pr-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent mb-4">
                <p className="text-zinc-300 leading-relaxed bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 text-sm md:text-base">
                    {result.advice}
                </p>
            </div>

            <div className="flex flex-col gap-3 w-full shrink-0 mt-auto">
                <button
                    onClick={onClose}
                    className="w-full py-4 bg-white text-black font-bold rounded-full hover:scale-[1.02] active:scale-95 transition-transform"
                >
                    Anlaşıldı 🫡
                </button>

                {onShare && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onShare();
                        }}
                        className="w-full py-3 bg-indigo-600/30 text-indigo-200 text-sm font-semibold rounded-full hover:bg-indigo-600/50 transition-colors flex items-center justify-center gap-2"
                    >
                        <span>🔥</span>
                        Anonim Olarak Paylaş
                    </button>
                )}
            </div>
        </div>
    ];

    const nextStep = () => {
        if (step < cards.length - 1) {
            setStep(step + 1);
            // Haptic here if possible
            if (navigator.vibrate) navigator.vibrate(50);
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div
                className="w-full max-w-sm aspect-[9/16] bg-zinc-900 rounded-3xl border border-zinc-800 relative overflow-hidden shadow-2xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 right-0 flex p-2 gap-1 z-20">
                    {cards.map((_, i) => (
                        <div key={i} className="h-1 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-white"
                                initial={{ width: "0%" }}
                                animate={{ width: i <= step ? "100%" : "0%" }}
                            />
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="w-full h-full" onClick={nextStep}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="w-full h-full"
                        >
                            {cards[step]}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Tap Hint */}
                {step < cards.length - 1 && (
                    <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                        <span className="text-xs text-zinc-500 animate-pulse">Devam etmek için dokun</span>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
