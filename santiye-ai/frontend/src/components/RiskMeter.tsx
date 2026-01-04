"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { PersonaType } from "@/lib/personas";

interface RiskMeterProps {
    isLoading: boolean;
    score: number | null;
    isVisible: boolean;
    persona: PersonaType;
}

const STEPS_BY_PERSONA: Record<PersonaType, { text: string; duration: number }[]> = {
    dedektif: [
        { text: "Cümleler analiz ediliyor...", duration: 2000 },
        { text: "Alt metinler taranıyor...", duration: 1500 },
        { text: "Çıkarımlar yapılıyor...", duration: 1800 },
        { text: "Parçalar birleştiriliyor...", duration: 1500 },
        { text: "Sonuç hazırlanıyor...", duration: 1200 },
    ],
    taktik: [
        { text: "Vibe kontrol ediliyor...", duration: 1500 },
        { text: "Sigma modu kalibre ediliyor...", duration: 1800 },
        { text: "Rizz seviyesi ölçülüyor...", duration: 1500 },
        { text: "En iyi taktikler aranıyor...", duration: 1500 },
        { text: "Geçmiş olsun dilekleri hazırlanıyor...", duration: 1000 },
    ]
};

export default function RiskMeter({ isLoading, isVisible, persona }: RiskMeterProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const steps = STEPS_BY_PERSONA[persona] || STEPS_BY_PERSONA['dedektif'];

    useEffect(() => {
        if (isLoading && isVisible) {
            let stepIndex = 0;
            setCurrentStep(0);

            const nextStep = () => {
                const step = steps[stepIndex];
                if (!step) return;

                setTimeout(() => {
                    stepIndex = (stepIndex + 1) % steps.length;
                    setCurrentStep(stepIndex);
                    nextStep();
                }, step.duration);
            };

            nextStep();
        }
    }, [isLoading, isVisible, steps]);

    if (!isVisible) return null;

    const isTaktik = persona === 'taktik';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-sm mx-auto my-4 px-4"
        >
            <div className={cn(
                "backdrop-blur-md border rounded-xl p-4 shadow-xl transition-colors",
                isTaktik
                    ? "bg-indigo-900/40 border-indigo-500/30"
                    : "bg-zinc-900/80 border-zinc-800"
            )}>
                {/* Header with Icon */}
                <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center animate-pulse",
                        isTaktik ? "bg-indigo-600" : "bg-zinc-800"
                    )}>
                        <span className="text-lg">{isTaktik ? "😈" : "🕵️"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className={cn(
                            "text-sm font-semibold truncate font-mono tracking-wide",
                            isTaktik ? "text-indigo-200" : "text-zinc-200"
                        )}>
                            {isTaktik ? "RIZZ MODE ACTIVATE" : "DEDEKTİF ANALİZİ"}
                        </h3>
                    </div>
                </div>

                {/* Progress Bar Container */}
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mb-2">
                    <motion.div
                        className={cn(
                            "h-full bg-gradient-to-r",
                            isTaktik
                                ? "from-indigo-500 via-blue-500 to-cyan-500"
                                : "from-indigo-500 via-purple-500 to-pink-500"
                        )}
                        animate={{
                            x: ["-100%", "100%"]
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 1.5,
                            ease: "linear"
                        }}
                    />
                </div>

                {/* Dynamic Step Text */}
                <div className="h-5 overflow-hidden relative">
                    <motion.p
                        key={currentStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-xs text-zinc-400 font-medium text-center absolute w-full"
                    >
                        {steps[currentStep].text}
                    </motion.p>
                </div>
            </div>
        </motion.div>
    );
}
