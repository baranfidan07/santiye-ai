"use client";

import { motion } from "framer-motion";
import { TriageOption } from "@/lib/personas";
import { cn } from "@/lib/utils";

interface TriageWidgetProps {
    question: string;
    options: TriageOption[];
    onSelect: (value: string) => void;
    disabled?: boolean;
}

export default function TriageWidget({ question, options, onSelect, disabled }: TriageWidgetProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm mx-auto px-2"
        >
            {/* Question Header */}
            <div className="text-center mb-3">
                <h2 className="text-lg font-bold text-white">{question}</h2>
            </div>

            {/* Options Grid - 2 columns for compactness */}
            <div className="grid grid-cols-2 gap-1.5">
                {options.map((option, index) => (
                    <motion.button
                        key={option.label}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => !disabled && onSelect(option.value)}
                        disabled={disabled}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            "px-2 py-2 rounded-lg text-center transition-all duration-200",
                            "bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700",
                            "text-white text-xs font-medium",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <span className="text-sm">{option.label.split(' ').pop()}</span>
                        <span className="block text-[10px] text-zinc-400 mt-0.5">
                            {option.label.replace(/\s*[\u{1F300}-\u{1F9FF}]/gu, '').substring(0, 15)}
                        </span>
                    </motion.button>
                ))}
            </div>

            {/* Skip Option */}
            <div className="text-center mt-3">
                <button
                    onClick={() => onSelect("Kendi durumumu anlatmak istiyorum.")}
                    className="text-zinc-500 text-xs hover:text-indigo-400 transition-colors"
                >
                    veya direkt yaz
                </button>
            </div>
        </motion.div>
    );
}
