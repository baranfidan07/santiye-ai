"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { Gavel, Send } from "lucide-react";
import { useState } from "react";

interface JuryDraftCardProps {
    intent?: string;
    draftContent?: string;
    onDraftOpen: () => void;
}

export default function JuryDraftCard({ intent, draftContent, onDraftOpen }: JuryDraftCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-3 mx-auto max-w-sm"
        >
            <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 border border-amber-500/30 rounded-2xl p-4 relative overflow-hidden group hover:border-amber-500/50 transition-colors shadow-lg shadow-amber-900/10">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Gavel size={80} />
                </div>

                <div className="relative z-10 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                        <span className="animate-bounce">🔥</span>
                        Jüri Karar Versin
                    </div>

                    <h3 className="text-white font-bold text-lg leading-tight">
                        Kim Haklı? Topluluğa Sor!
                    </h3>

                    <p className="text-amber-100/70 text-sm">
                        Bu olay tam jürilik. Senin için anonim bir taslak hazırladım. Tek tıkla binlerce kişiye sor.
                    </p>

                    <button
                        onClick={onDraftOpen}
                        className="mt-2 inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold py-2.5 px-4 rounded-xl transition-all active:scale-95 shadow-lg"
                    >
                        Taslağı Gör & Paylaş
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
