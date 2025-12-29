"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type RelationshipStatus = "flirting" | "dating" | "complicated" | "ex" | "married" | "crush";

interface ContextSelectorProps {
    selected: RelationshipStatus | null;
    onSelect: (status: RelationshipStatus) => void;
    disabled?: boolean;
}

const CONTEXT_OPTIONS: { id: RelationshipStatus; label: string; icon: string }[] = [
    { id: "flirting", label: "Flört", icon: "😏" },
    { id: "dating", label: "Sevgili", icon: "❤️" },
    { id: "complicated", label: "Karışık", icon: "🌀" },
    { id: "ex", label: "Eski Sevgili", icon: "💔" },
    { id: "crush", label: "Platonik", icon: "😍" },
    { id: "married", label: "Evli", icon: "💍" },
];

export default function ContextSelector({ selected, onSelect, disabled }: ContextSelectorProps) {
    return (
        <div className="w-full py-2">
            <div className="flex flex-wrap gap-2 justify-center px-4">
                {CONTEXT_OPTIONS.map((option) => (
                    <motion.button
                        key={option.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => !disabled && onSelect(option.id)}
                        disabled={disabled}
                        className={cn(
                            "flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all border",
                            selected === option.id
                                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                                : "bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <span>{option.icon}</span>
                        <span>{option.label}</span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
