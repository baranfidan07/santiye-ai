"use client";

import { motion, AnimatePresence } from "framer-motion";
import { User, Sparkles, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

import { PersonaType } from "@/lib/personas";
import ResultLock from "./ResultLock";

export type ReactionType = 'thumbs_up' | 'thumbs_down';

interface MessageBubbleProps {
    role: "user" | "ai";
    content: string;
    riskScore?: number;
    confidence?: number;
    persona?: PersonaType;
    onReact?: (reaction: ReactionType) => void;
    isLocked?: boolean;
}

export default function MessageBubble({ role, content, riskScore, confidence, persona, onReact, isLocked }: MessageBubbleProps) {
    const isUser = role === "user";
    const isRizzMode = persona === 'taktik';
    const [showAura, setShowAura] = useState(false);
    const [selectedReaction, setSelectedReaction] = useState<ReactionType | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    // Typewriter State
    const [displayedContent, setDisplayedContent] = useState(isUser || !!isLocked ? content : "");
    const [isTyping, setIsTyping] = useState(!isUser && !isLocked);

    // Helper to determine if we should show the lock
    const shouldLock = !isUser && !!isLocked;

    // Parse numbered replies from content (e.g., "1. COOL: message")
    const parseReplies = (text: string): { intro: string; replies: string[] } => {
        const lines = text.split('\n');
        const replies: string[] = [];
        let intro = '';

        for (const line of lines) {
            // Match patterns like "1. ", "2. ", "1️⃣", etc.
            if (/^[1-3][.:\)]\s|^[1-3]️⃣/.test(line.trim())) {
                replies.push(line.trim());
            } else if (replies.length === 0) {
                intro += (intro ? '\n' : '') + line;
            }
        }

        return { intro: intro.trim(), replies };
    };

    // Copy reply to clipboard
    const copyReply = async (reply: string, index: number) => {
        // Extract just the message part (after the colon or label)
        const messageMatch = reply.match(/:\s*["']?(.+?)["']?$/);
        const textToCopy = messageMatch ? messageMatch[1].trim().replace(/["']$/, '') : reply.replace(/^[1-3][.:\)]\s*/, '').trim();

        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Typewriter Effect
    useEffect(() => {
        if (isUser || shouldLock) {
            setDisplayedContent(content);
            setIsTyping(false);
            return;
        }

        // Reset if content changes (rare but good safety)
        setDisplayedContent("");
        setIsTyping(true);

        let currentIndex = 0;
        const speed = 15; // ms per char (adjust for feel)
        const contentLength = content.length; // Capture length at start

        const interval = setInterval(() => {
            if (currentIndex < contentLength) {
                const char = content[currentIndex];
                // Guard against undefined - only add if char exists
                if (char !== undefined) {
                    setDisplayedContent(prev => prev + char);
                }
                currentIndex++;
            } else {
                setIsTyping(false);
                clearInterval(interval);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [content, isUser, shouldLock]);

    const handleReaction = (type: ReactionType) => {
        if (selectedReaction || !onReact) return;
        setSelectedReaction(type);
        setShowAura(true);
        onReact(type);
        setTimeout(() => setShowAura(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "flex gap-4 w-full max-w-3xl mx-auto p-4 group relative",
                isUser ? "flex-row-reverse" : "flex-row"
            )}
        >
            {/* Avatar */}
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg",
                isUser
                    ? "bg-zinc-700 text-zinc-300"
                    : isRizzMode
                        ? "bg-black border border-emerald-500/50 text-emerald-400"
                        : "bg-indigo-600 text-white"
            )}>
                {isUser ? <User size={16} /> : isRizzMode ? <span className="text-lg">😈</span> : <Sparkles size={16} />}
            </div>

            {/* Message Content */}
            <div className={cn(
                "flex flex-col gap-2 max-w-[85%]",
                isUser ? "items-end" : "items-start"
            )}>
                <div className={cn(
                    "rounded-2xl px-4 py-3 leading-relaxed text-base md:text-lg relative",
                    isUser
                        ? "bg-zinc-800 text-zinc-100 rounded-tr-none font-normal"
                        : "bg-zinc-800 text-zinc-100 rounded-tl-none border border-zinc-700/50 font-normal"
                )}>
                    <ResultLock isLocked={shouldLock}>
                        {isUser ? content : (() => {
                            // For rizz mode, parse and show replies as cards
                            if (isRizzMode && !isTyping) {
                                const { intro, replies } = parseReplies(displayedContent);

                                if (replies.length > 0) {
                                    return (
                                        <div className="space-y-3">
                                            {intro && (
                                                <p className="text-zinc-100 leading-relaxed">{intro}</p>
                                            )}
                                            <div className="space-y-2 mt-2">
                                                {replies.map((reply, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="bg-zinc-900/80 border border-zinc-700/50 rounded-xl p-3 flex items-start justify-between gap-2 hover:border-zinc-500/50 transition-colors group"
                                                    >
                                                        <span className="text-zinc-100 text-sm leading-relaxed flex-1">
                                                            {reply}
                                                        </span>
                                                        <button
                                                            onClick={() => copyReply(reply, idx)}
                                                            className="shrink-0 p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/30 text-indigo-400 transition-all active:scale-95"
                                                            title="Copy"
                                                        >
                                                            {copiedIndex === idx ? (
                                                                <Check size={14} className="text-indigo-300" />
                                                            ) : (
                                                                <Copy size={14} />
                                                            )}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }
                            }

                            // Default display
                            return (
                                <span className="whitespace-pre-wrap leading-7">
                                    {displayedContent}
                                    {isTyping && <span className="inline-block w-1.5 h-4 ml-0.5 bg-current animate-pulse align-middle" />}
                                </span>
                            );
                        })()}
                    </ResultLock>

                    {/* Aura Animation (Only if NOT locked) */}
                    <AnimatePresence>
                        {!shouldLock && showAura && (
                            <motion.div
                                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                                animate={{ opacity: 1, y: -40, scale: 1.2 }}
                                exit={{ opacity: 0 }}
                                className="absolute -top-10 right-0 bg-indigo-500 text-white font-bold text-xs px-2 py-1 rounded-full shadow-lg z-50 pointer-events-none border border-indigo-400"
                            >
                                +1 KREDİ 💎
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* REACTION BAR (AI Only, Not Locked) */}
                {!isUser && onReact && !shouldLock && (
                    <div className={cn(
                        "flex items-center gap-2 mt-2 transition-opacity duration-200",
                        selectedReaction ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}>
                        <span className="text-[10px] text-zinc-500 font-medium mr-1">Faydalı mı?</span>
                        {[
                            { id: 'thumbs_up', emoji: '👍', label: 'Good' },
                            { id: 'thumbs_down', emoji: '👎', label: 'Bad' },
                        ].map((reaction) => (
                            <button
                                key={reaction.id}
                                onClick={() => handleReaction(reaction.id as ReactionType)}
                                disabled={!!selectedReaction}
                                className={cn(
                                    "p-1.5 rounded-lg border transition-all text-sm flex items-center justify-center w-8 h-8",
                                    selectedReaction === reaction.id
                                        ? "bg-indigo-500/20 border-indigo-500 text-white scale-110"
                                        : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
                                )}
                                title={reaction.label}
                            >
                                {reaction.emoji}
                            </button>
                        ))}
                    </div>
                )}

                {/* Risk Score Widget for AI */}
                {!isUser && typeof riskScore === 'number' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }} // Delay appearing slightly
                    >
                        <div className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-3 mt-2">
                            <div className="relative w-10 h-10 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-zinc-700" />
                                    <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="transparent"
                                        strokeDasharray={100}
                                        strokeDashoffset={100 - (100 * riskScore) / 100}
                                        className={cn(
                                            riskScore > 70 ? "text-red-500" : riskScore > 40 ? "text-yellow-500" : "text-emerald-500"
                                        )}
                                    />
                                </svg>
                                <span className="absolute text-[10px] font-bold text-white">%{riskScore}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-zinc-400 uppercase tracking-wide">Risk Skoru</span>
                                <span className={cn(
                                    "text-sm font-medium",
                                    riskScore > 70 ? "text-red-400" : riskScore > 40 ? "text-yellow-400" : "text-emerald-400"
                                )}>
                                    {riskScore > 70 ? "Yüksek Risk" : riskScore > 40 ? "Dikkat" : "Güvenli"}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
