"use client";

import { motion } from "framer-motion";
import { ChevronRight, BrainCircuit } from "lucide-react";

interface QuizCardProps {
    title: string;
    description: string;
    progress: number;
    onClick?: () => void;
}

export default function QuizCard({ title, description, progress, onClick }: QuizCardProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={onClick}
            className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 cursor-pointer overflow-hidden hover:border-indigo-500/50 transition-all"
        >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center mb-4 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    <BrainCircuit size={20} />
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-zinc-400 mb-6">{description}</p>

                <div className="flex items-center justify-between text-xs font-medium">
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-zinc-500">%{progress}</span>
                    </div>

                    <div className="flex items-center gap-1 text-indigo-400 group-hover:translate-x-1 transition-transform">
                        Başla <ChevronRight size={14} />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
