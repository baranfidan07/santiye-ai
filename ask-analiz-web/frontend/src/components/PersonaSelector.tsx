"use client";

import { motion } from "framer-motion";
import { PERSONAS, PersonaType } from "@/lib/personas";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface PersonaSelectorProps {
    selected: PersonaType;
    onSelect: (persona: PersonaType) => void;
    disabled?: boolean;
}

export default function PersonaSelector({ selected, onSelect, disabled }: PersonaSelectorProps) {
    const t = useTranslations('persona');
    return (
        <div className="w-full px-2">
            <div className="flex justify-center gap-2">
                {PERSONAS.map((persona) => (
                    <motion.button
                        key={persona.id}
                        onClick={() => !disabled && onSelect(persona.id)}
                        whileTap={{ scale: 0.95 }}
                        disabled={disabled}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                            "border",
                            selected === persona.id
                                ? "bg-indigo-600 border-indigo-500 text-white"
                                : "bg-zinc-800/50 border-zinc-700 text-zinc-300",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <span>{persona.emoji}</span>
                        <span>{t(persona.id as any)}</span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
