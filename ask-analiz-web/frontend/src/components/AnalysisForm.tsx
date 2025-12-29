"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Activity, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AnalysisForm() {
    const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
    const [text, setText] = useState("");
    const [result, setResult] = useState<{ risk_score: number; insight: string } | null>(null);

    const handleSubmit = async () => {
        if (!text.trim()) return;

        setStatus("loading");

        try {
            const response = await fetch("http://localhost:8000/analyze", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text }),
            });

            const data = await response.json();
            setResult(data);
            setStatus("success");
        } catch (error) {
            console.error("Analysis failed", error);
            setStatus("idle"); // Reset on error for now
            alert("Bir hata oluştu. Lütfen tekrar deneyin.");
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto px-4 min-h-[400px]">
            <AnimatePresence mode="wait">
                {status === "idle" && (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col gap-4"
                    >
                        <div className="relative">
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="İlişkinizdeki durumu veya sizi şüphelendiren olayı anlatın..."
                                className="w-full h-48 bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-6 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 resize-none transition-all duration-300 text-lg"
                            />
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={!text.trim()}
                            className="group flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            Analize Başla
                        </button>
                    </motion.div>
                )}

                {status === "loading" && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center h-48 gap-8"
                    >
                        <div className="relative w-24 h-24">
                            <motion.div
                                className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"
                            />
                            <motion.div
                                className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Activity className="w-8 h-8 text-indigo-400" />
                            </div>
                        </div>
                        <p className="text-zinc-400 animate-pulse text-sm tracking-widest uppercase">Veriler İşleniyor...</p>
                    </motion.div>
                )}

                {status === "success" && result && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-800/50 border border-zinc-700/50 rounded-3xl p-8 md:p-10"
                    >
                        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                            <div className="relative flex items-center justify-center">
                                {/* Risk Score Circle */}
                                <svg className="w-40 h-40 transform -rotate-90">
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        className="text-zinc-700"
                                    />
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray={440}
                                        strokeDashoffset={440 - (440 * result.risk_score) / 100}
                                        className={cn(
                                            "text-indigo-500 transition-all duration-1000 ease-out",
                                            result.risk_score > 70 ? "text-red-500" : result.risk_score > 40 ? "text-yellow-500" : "text-emerald-500"
                                        )}
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-3xl font-bold text-white">%{result.risk_score}</span>
                                    <span className="text-xs text-zinc-500 uppercase tracking-wider">Risk Skoru</span>
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-xl font-semibold text-white mb-2 flex items-center justify-center md:justify-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-indigo-400" />
                                    Analiz Sonucu
                                </h3>
                                <p className="text-zinc-300 leading-relaxed">
                                    {result.insight}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-zinc-700/50">
                            <button
                                onClick={() => { setStatus("idle"); setText(""); }}
                                className="w-full py-3 text-sm text-zinc-400 hover:text-white transition-colors"
                            >
                                Yeni Analiz Yap
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
