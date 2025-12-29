"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface HeartRevealLoaderProps {
    progress: number; // 0-100
    onReveal: () => void;
    isVisible: boolean;
}

export default function HeartRevealLoader({ progress, onReveal, isVisible }: HeartRevealLoaderProps) {
    const [state, setState] = useState<'loading' | 'ready' | 'revealed'>('loading');

    useEffect(() => {
        if (progress >= 100) {
            setState('ready');
        } else {
            setState('loading');
        }
    }, [progress]);

    const handleClick = () => {
        if (state === 'ready') {
            setState('revealed');
            onReveal();
        }
    };

    // Calculate fill height (0-100% from bottom)
    const fillHeight = Math.min(progress, 100);

    return (
        <AnimatePresence>
            {isVisible && state !== 'revealed' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    className="fixed bottom-28 right-4 z-50 flex flex-col items-center gap-2"
                >
                    {/* Tooltip Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-bold shadow-lg",
                            state === 'ready'
                                ? "bg-pink-500 text-white animate-pulse"
                                : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                        )}
                    >
                        {state === 'ready' ? "💖 SONUCU GÖR" : `Analiz... ${Math.round(progress)}%`}
                    </motion.div>

                    {/* Heart FAB Button */}
                    <motion.button
                        onClick={handleClick}
                        disabled={state !== 'ready'}
                        className={cn(
                            "relative w-16 h-16 rounded-full bg-zinc-900 border-2 shadow-xl transition-all duration-300 flex items-center justify-center",
                            state === 'ready'
                                ? "border-pink-500 cursor-pointer shadow-pink-500/30"
                                : "border-zinc-700 cursor-default"
                        )}
                        animate={state === 'ready' ? {
                            scale: [1, 1.1, 1],
                        } : {}}
                        transition={state === 'ready' ? {
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "easeInOut"
                        } : {}}
                        whileTap={state === 'ready' ? { scale: 0.9 } : {}}
                    >
                        {/* Background Heart (Empty) */}
                        <svg
                            viewBox="0 0 24 24"
                            className="absolute w-8 h-8 text-zinc-700"
                            fill="currentColor"
                        >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>

                        {/* Liquid Fill Heart */}
                        <div
                            className="absolute w-8 h-8 overflow-hidden"
                            style={{
                                clipPath: `inset(${100 - fillHeight}% 0 0 0)`
                            }}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                className={cn(
                                    "w-full h-full transition-colors duration-500",
                                    state === 'ready'
                                        ? "text-pink-500"
                                        : "text-pink-600/70"
                                )}
                                fill="currentColor"
                            >
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        </div>

                        {/* Glow Ring when Ready */}
                        {state === 'ready' && (
                            <motion.div
                                className="absolute inset-0 rounded-full border-2 border-pink-400"
                                animate={{
                                    opacity: [0.5, 1, 0.5],
                                    scale: [1, 1.2, 1]
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                        )}
                    </motion.button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
