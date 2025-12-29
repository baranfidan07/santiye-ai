"use client";

import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, BrainCircuit } from "lucide-react";
import AuroraBackground from "@/components/AuroraBackground";

// LocalStorage key for quiz progress
const getProgressKey = (quizId: string) => `quiz_progress_${quizId}`;

interface QuizProgress {
    currentQuestionIndex: number;
    answers: boolean[];
    isFinished: boolean;
}

export default function QuizRunnerPage() {
    const t = useTranslations('quizzes');
    const params = useParams();
    const router = useRouter();
    const quizId = params.id as string;

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<boolean[]>([]);
    const [isFinished, setIsFinished] = useState(false);
    const [loaded, setLoaded] = useState(false);

    // Load saved progress from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(getProgressKey(quizId));
            if (saved) {
                try {
                    const progress: QuizProgress = JSON.parse(saved);
                    setCurrentQuestionIndex(progress.currentQuestionIndex);
                    setAnswers(progress.answers);
                    setIsFinished(progress.isFinished);
                } catch (e) {
                    console.error("Failed to parse quiz progress:", e);
                }
            }
            setLoaded(true);
        }
    }, [quizId]);

    // Save progress to localStorage on change
    useEffect(() => {
        if (loaded && typeof window !== 'undefined') {
            const progress: QuizProgress = {
                currentQuestionIndex,
                answers,
                isFinished
            };
            localStorage.setItem(getProgressKey(quizId), JSON.stringify(progress));
        }
    }, [currentQuestionIndex, answers, isFinished, quizId, loaded]);

    // Fetch questions safely. If key missing, return empty array to avoid crash
    const questions = ["0", "1", "2"].map(idx => {
        try {
            return t(`questions.${quizId}.${idx}`);
        } catch (e) {
            return null;
        }
    }).filter(q => q && !q.includes("questions."));

    // Fallback if no questions found (or key is equal to path)
    if (questions.length === 0 || questions[0] === `questions.${quizId}.0`) {
        return <div className="p-8 text-center text-zinc-500">Quiz not found or empty (ID: {quizId})</div>;
    }

    // Don't render until loaded from localStorage to prevent flicker
    if (!loaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-zinc-500">{t('loading') || 'Yükleniyor...'}</div>
            </div>
        );
    }

    const handleAnswer = (answer: boolean) => {
        const newAnswers = [...answers, answer];
        setAnswers(newAnswers);

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            setIsFinished(true);
        }
    };

    const handleRestart = () => {
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setIsFinished(false);
        localStorage.removeItem(getProgressKey(quizId));
    };

    const calculateResult = () => {
        const yesCount = answers.filter(a => a).length;
        if (yesCount === 0) return { key: 'result_risk_low', color: 'text-green-400' };
        if (yesCount <= 2) return { key: 'result_risk_medium', color: 'text-yellow-400' };
        return { key: 'result_risk_high', color: 'text-red-500' };
    };

    if (isFinished) {
        const result = calculateResult();
        const quizTitle = t(`items.${quizId}.title`);
        const resultText = t(result.key);

        return (
            <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
                <AuroraBackground isInteracting={false} persona="dedektif" />

                <div className="relative z-10 max-w-xl mx-auto p-6 md:p-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl"
                    >
                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={32} className={result.color} />
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2">{quizTitle}</h2>
                        <p className="text-zinc-400 mb-6">{t('completed')}</p>

                        <div className="text-3xl font-black mb-8 tracking-tight">
                            <span className={result.color}>{resultText}</span>
                        </div>

                        <button
                            onClick={() => {
                                // Clear progress when analyzing
                                localStorage.removeItem(getProgressKey(quizId));
                                router.push(`/?quiz_result=${encodeURIComponent(JSON.stringify({
                                    quiz: quizTitle,
                                    result: resultText,
                                    score: answers.filter(a => a).length,
                                    total: questions.length
                                }))}`);
                            }}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                        >
                            <BrainCircuit size={20} />
                            {t('result_analyze_btn')}
                        </button>

                        <div className="flex gap-4 mt-4 justify-center">
                            <button
                                onClick={handleRestart}
                                className="text-zinc-500 hover:text-white text-sm"
                            >
                                {t('restart') || 'Yeniden Başla'}
                            </button>
                            <button
                                onClick={() => router.push('/quizzes')}
                                className="text-zinc-500 hover:text-white text-sm"
                            >
                                {t('back_to_quizzes')}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-hidden flex flex-col justify-center">
            <AuroraBackground isInteracting={false} persona="dedektif" />

            <div className="relative z-10 max-w-2xl mx-auto p-4 md:p-8 w-full">
                <header className="mb-8 text-center">
                    <span className="text-xs font-bold text-indigo-500 tracking-widest uppercase mb-2 block">
                        {t('question_label')} {currentQuestionIndex + 1} / {questions.length}
                    </span>
                    <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-indigo-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
                        />
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestionIndex}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        className="mb-8"
                    >
                        <h2 className="text-2xl md:text-3xl font-bold text-white text-center leading-tight">
                            {questions[currentQuestionIndex]}
                        </h2>
                    </motion.div>
                </AnimatePresence>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => handleAnswer(false)}
                        className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition-all font-semibold text-zinc-300 hover:text-white"
                    >
                        {t('no')}
                    </button>
                    <button
                        onClick={() => handleAnswer(true)}
                        className="p-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 border border-transparent transition-all font-bold text-white relative group overflow-hidden"
                    >
                        <span className="relative z-10">{t('yes')}</span>
                    </button>
                </div>

                {/* Resume indicator */}
                {answers.length > 0 && (
                    <div className="mt-6 text-center">
                        <button
                            onClick={handleRestart}
                            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                        >
                            {t('restart') || 'Sıfırla ve Yeniden Başla'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
