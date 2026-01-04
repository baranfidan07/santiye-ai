"use client";

import { useState, useEffect } from "react";
import QuizCard from "@/components/QuizCard";
import AuroraBackground from "@/components/AuroraBackground";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

const QUIZ_IDS = ["gaslighting", "cheating", "attachment", "lovebomb"];

// Number of questions per quiz (should match the actual count)
const QUESTIONS_PER_QUIZ = 3;

export default function QuizzesPage() {
    const t = useTranslations('quizzes');
    const router = useRouter();
    const [quizProgress, setQuizProgress] = useState<Record<string, number>>({});

    // Load progress from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const progress: Record<string, number> = {};

            QUIZ_IDS.forEach(quizId => {
                const saved = localStorage.getItem(`quiz_progress_${quizId}`);
                if (saved) {
                    try {
                        const data = JSON.parse(saved);
                        if (data.isFinished) {
                            progress[quizId] = 100;
                        } else {
                            progress[quizId] = Math.round((data.answers?.length || 0) / QUESTIONS_PER_QUIZ * 100);
                        }
                    } catch (e) {
                        progress[quizId] = 0;
                    }
                } else {
                    progress[quizId] = 0;
                }
            });

            setQuizProgress(progress);
        }
    }, []);

    return (
        <div className="relative min-h-screen overflow-y-auto pb-24">
            <AuroraBackground isInteracting={false} persona="dedektif" />

            <div className="relative z-10 p-4 md:p-8 max-w-5xl mx-auto pt-16">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">{t('title')}</h1>
                    <p className="text-zinc-400">{t('subtitle')}</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {QUIZ_IDS.map((quizId) => (
                        <QuizCard
                            key={quizId}
                            title={t(`items.${quizId}.title`)}
                            description={t(`items.${quizId}.description`)}
                            progress={quizProgress[quizId] || 0}
                            onClick={() => router.push(`/quizzes/${quizId}`)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
