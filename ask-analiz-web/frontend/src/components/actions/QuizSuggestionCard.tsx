"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/routing";
import { ArrowRight, BrainCircuit } from "lucide-react";

interface QuizSuggestionCardProps {
    intent: string;
}

export default function QuizSuggestionCard({ intent }: QuizSuggestionCardProps) {
    // Determine which quiz to show based on context/intent (implied)
    // For now, we default to the "Toxic Test" as it's the most popular
    // In future, we can pass specific quiz IDs from backend

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-3 mx-auto max-w-sm"
        >
            <div className="bg-gradient-to-r from-violet-900/50 to-indigo-900/50 border border-indigo-500/30 rounded-2xl p-4 relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <BrainCircuit size={80} />
                </div>

                <div className="relative z-10 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                        <span className="animate-pulse">✨</span>
                        Önerilen Test
                    </div>

                    <h3 className="text-white font-bold text-lg leading-tight">
                        Kendini Tanı: İlişkide Toksik Olan Sen Misin?
                    </h3>

                    <p className="text-indigo-200/70 text-sm">
                        Yapay zeka kafanın karışık olduğunu sezdi. Bu 1 dakikalık testle gerçeklerle yüzleş.
                    </p>

                    <Link
                        href="/quizzes/toxic-test"
                        className="mt-2 inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-900/20"
                    >
                        Testi Başlat
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
