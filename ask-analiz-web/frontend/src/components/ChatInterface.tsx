"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import MessageBubble from "./MessageBubble";
import InputArea from "./InputArea";
import PersonaSelector from "./PersonaSelector";
import RiskMeter from "./RiskMeter";
import StoryResult from "./StoryResult";
import AuroraBackground from "./AuroraBackground";
import SituationWizard from "./SituationWizard";
import { PersonaType, PERSONAS } from "@/lib/personas";
import { PREDICTION_GRAPH, FLIRT_GRAPH } from "@/lib/situationGraph";
import { motion, AnimatePresence } from "framer-motion";
import CreateConfessionModal from "./CreateConfessionModal";
import QuizSuggestionCard from "./actions/QuizSuggestionCard";
import JuryDraftCard from "./actions/JuryDraftCard";
import { useTranslations, useLocale } from "next-intl";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useCredits } from "@/contexts/CreditsContext";

interface Message {
    id: string;
    role: "user" | "ai";
    content: string;
    riskScore?: number;
    confidence?: number;
    actionTrigger?: string | null;
    intent?: string | null;
}

export default function ChatInterface() {
    const t = useTranslations('chat');
    const tWizard = useTranslations('wizard');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session");

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [selectedPersona, setSelectedPersona] = useState<PersonaType>('dedektif');
    const [selectedMood, setSelectedMood] = useState<'cesur' | 'cool' | 'toxic' | 'romantik'>('cool');
    const [storyResult, setStoryResult] = useState<any>(null);
    const [readyResult, setReadyResult] = useState<any>(null);
    const [juryPrompt, setJuryPrompt] = useState<{ show: boolean; hook: string; content: string } | null>(null);

    const { auraPoints, logFeedback } = useAnalytics(user?.id);
    const { credits, deductCredit, showAdModal, setShowAdModal, refreshCredits } = useCredits();

    const [isConfessionModalOpen, setIsConfessionModalOpen] = useState(false);
    const [confessionDraft, setConfessionDraft] = useState({ title: "", content: "" });
    const [showMobileSuggestions, setShowMobileSuggestions] = useState(true);

    // Mood options for Flört Koçu
    const MOOD_OPTIONS = [
        { id: 'cesur' as const, emoji: '🔥', label: locale === 'tr' ? 'Cesur' : 'Bold' },
        { id: 'cool' as const, emoji: '😎', label: locale === 'tr' ? 'Cool' : 'Chill' },
        { id: 'toxic' as const, emoji: '😈', label: locale === 'tr' ? 'Toxic' : 'Toxic' },
        { id: 'romantik' as const, emoji: '🥰', label: locale === 'tr' ? 'Romantik' : 'Romantic' },
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleVoiceResponse = (userText: string, aiText: string, audioBase64: string) => {
        // 1. Add User Message
        const tempId = Date.now().toString();
        const userMsg: Message = { id: tempId, role: "user", content: userText };
        setMessages(prev => [...prev, userMsg]);

        // 2. Play Audio (If available)
        if (audioBase64) {
            try {
                const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
                audio.play();
            } catch (e) {
                console.error("Audio playback failed", e);
            }
        }

        // 3. Add AI Message
        // If no audio, add immediately. If audio, maybe delay? 
        // Let's add immediately for text-only mode responsiveness.
        const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "ai",
            content: aiText,
            confidence: 85
        };
        setMessages(prev => [...prev, aiMsg]);
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };
        checkAuth();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (!sessionId) {
            setMessages([]);
            setJuryPrompt(null);
            setReadyResult(null);
            return;
        }

        if (!user) {
            return;
        }

        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .eq("session_id", sessionId)
                .order("created_at", { ascending: true });

            if (data) {
                const mapped: Message[] = data.map(m => ({
                    id: m.id,
                    role: m.role as "user" | "ai",
                    content: m.content,
                    riskScore: m.risk_score,
                    confidence: m.confidence,
                    // Load triggers if saved (need DB schema update later, for now memory only for session)
                    actionTrigger: null
                }));
                setMessages(mapped);
            }
        };

        fetchMessages();
    }, [sessionId, user]);

    // GHOST SESSION: Save messages to localStorage if guest
    useEffect(() => {
        if (!user && messages.length > 0 && !isLoading) {
            localStorage.setItem('ghost_session', JSON.stringify({
                messages,
                persona: selectedPersona,
                timestamp: Date.now()
            }));
        }
    }, [messages, user, isLoading, selectedPersona]);

    // GHOST SESSION: Restore if exists after login
    useEffect(() => {
        const restoreGhostSession = async () => {
            // Only restore if user is logged in AND current session is empty
            if (user && messages.length === 0 && !sessionId) {
                const ghostData = localStorage.getItem('ghost_session');
                if (ghostData) {
                    try {
                        const { messages: ghostMessages, persona } = JSON.parse(ghostData);

                        // Clear storage to prevent loops
                        localStorage.removeItem('ghost_session');

                        // 1. Create a real session in DB
                        const firstUserMsg = ghostMessages.find((m: any) => m.role === 'user')?.content || "Analiz";
                        const { data: newSession } = await supabase
                            .from("chat_sessions")
                            .insert([{ user_id: user.id, title: firstUserMsg.substring(0, 30) + "..." }])
                            .select()
                            .single();

                        if (newSession) {
                            // 2. Insert the ghost messages
                            // We need to re-run analysis for the FULL report since guest version was cut
                            // But for now, let's just restore context and trigger a re-generation nicely

                            // Restore UI state first
                            setMessages(ghostMessages);
                            setSelectedPersona(persona || 'dedektif');

                            // Redirect to this new session
                            router.replace(`/?session=${newSession.id}`);

                            // 3. Trigger a "Full Analysis Unlock" call automatically
                            // We construct the history and ask AI again in 'full' mode
                            const conversationHistory = ghostMessages.map((m: any) => ({
                                role: m.role === 'user' ? 'user' : 'assistant',
                                content: m.content
                            }));

                            setIsLoading(true);
                            // Call API with full mode
                            const response = await fetch("/api/analyze", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    messages: conversationHistory,
                                    persona: persona || 'dedektif',
                                    language: locale,
                                    mode: 'full' // FORCE FULL MODE
                                }),
                            });

                            const data = await response.json();
                            setIsLoading(false);

                            // Add the new FULL analysis as a message
                            const fullAnalysisMsg = {
                                id: Date.now().toString(),
                                role: "ai",
                                content: data.insight || data.question,
                                riskScore: data.risk_score,
                            };

                            // Save to DB
                            // We save previous messages first
                            for (const m of ghostMessages) {
                                await supabase.from("messages").insert([{
                                    session_id: newSession.id,
                                    role: m.role,
                                    content: m.content,
                                    risk_score: m.riskScore
                                }]);
                            }

                            // Save new detailed analysis
                            await supabase.from("messages").insert([{
                                session_id: newSession.id,
                                role: "ai",
                                content: fullAnalysisMsg.content,
                                risk_score: fullAnalysisMsg.riskScore
                            }]);

                            setMessages(prev => [...prev, fullAnalysisMsg as Message]);

                        }
                    } catch (e) {
                        console.error("Ghost restore failed", e);
                    }
                }
            }
        };

        restoreGhostSession();
    }, [user, sessionId]); // Run when user logs in

    useEffect(() => {
        const quizResultParam = searchParams.get("quiz_result");
        if (quizResultParam && !isLoading && messages.length === 0) {
            try {
                const data = JSON.parse(decodeURIComponent(quizResultParam));
                setSelectedPersona('dedektif');

                const prompt = t('quiz_result_prompt', {
                    quiz: data.quiz,
                    result: data.result,
                    score: data.score,
                    total: data.total
                });

                setInput(prompt);
            } catch (e) {
                console.error("Failed to parse quiz result", e);
            }
        }
    }, [searchParams]);

    const handleShareStory = async () => {
        if (!storyResult && !readyResult) return;
        const contextData = storyResult || readyResult;
        if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate(50);
        const conversationContext = messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
        }));

        try {
            const res = await fetch("/api/generate-confession", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: conversationContext })
            });

            if (!res.ok) throw new Error("API call failed");

            const data = await res.json();
            setConfessionDraft({
                title: t('confession_share_title'),
                content: data.confession_text || "Bir şeyler ters gitti."
            });
            setIsConfessionModalOpen(true);
        } catch (e) {
            console.error("Failed to generate draft", e);
            setConfessionDraft({
                title: "Anonim İtiraf",
                content: "Olay şöyle gelişti... (Yapay zeka bağlantı hatası, lütfen elle düzenleyin)"
            });
            setIsConfessionModalOpen(true);
        }
    };

    const handleSubmit = async () => {
        if ((!input.trim() && !selectedImage) || isLoading) return;

        // Credit Check for New Sessions (Logged In Users Only)
        if (!sessionId) {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser) {
                const success = await deductCredit();
                if (!success) {
                    return; // Modal will be shown via context
                }
            }
        }

        setIsLoading(true);
        setLoadingProgress(0);

        const currentInput = input;
        const currentImage = selectedImage;
        const aiPrompt = currentInput;

        setInput("");
        setSelectedImage(null);

        const progressInterval = setInterval(() => {
            setLoadingProgress(prev => {
                if (prev >= 85) return prev;
                return prev + 2 + Math.random() * 3;
            });
        }, 500);

        let currentSessionId = sessionId;
        if (!currentSessionId) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const title = currentInput.substring(0, 30) || "Görsel Analiz";
                const { data: newSession } = await supabase
                    .from("chat_sessions")
                    .insert([{ user_id: user.id, title: title + "..." }])
                    .select()
                    .single();

                if (newSession) {
                    currentSessionId = newSession.id;
                    router.replace(`/?session=${newSession.id}`);
                }
            }
        }

        const tempId = Date.now().toString();

        const userMessage: Message = {
            id: tempId,
            role: "user",
            content: currentInput,
        };
        if (currentImage) {
            userMessage.content += " [Görsel Eklendi]";
        }

        setMessages((prev) => [...prev, userMessage]);

        if (currentSessionId) {
            await supabase.from("messages").insert([{
                session_id: currentSessionId,
                role: "user",
                content: currentInput + (currentImage ? " [Görsel Eklendi]" : "")
            }]);
        }

        try {
            let response;

            console.log("Submit triggered. Image present:", !!currentImage);

            if (currentImage) {
                console.log("Starting Image Upload...");
                // 1. Upload to GCS
                const base64Data = currentImage.split(',')[1];
                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'image/png' }); // InputArea uses png typically

                const formData = new FormData();
                formData.append('file', blob);

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData
                });
                const uploadData = await uploadRes.json();

                if (!uploadData.gsUri) throw new Error("Image upload failed");

                // 2. Analyze with Vertex AI (Vision)
                // We pass the persona system prompt so Vision behaves like the persona
                const personaConfig = selectedPersona === 'taktik' ? PERSONAS[1] : PERSONAS[0];
                const systemPrompt = locale === 'tr' ? personaConfig.systemPrompt.tr : personaConfig.systemPrompt.en;

                response = await fetch("/api/analyze-vision", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        gsUri: uploadData.gsUri,
                        personaSystemPrompt: systemPrompt + `\n\nUSER CONTEXT: ${aiPrompt}`,
                    }),
                });

            } else {
                // Standard Text Analysis
                const conversationHistory = messages.map(m => ({
                    role: m.role === 'user' ? 'user' : 'assistant',
                    content: m.content
                }));

                const finalPrompt = aiPrompt;

                conversationHistory.push({
                    role: 'user',
                    content: finalPrompt
                });

                response = await fetch("/api/analyze", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        messages: conversationHistory,
                        persona: selectedPersona,
                        language: locale,
                        mood: selectedPersona === 'taktik' ? selectedMood : undefined,
                        mode: user ? 'full' : 'mini'
                    }),
                });
            }
            const data = await response.json();

            clearInterval(progressInterval);
            setIsLoading(false);

            let aiContent = "";
            let risk: number | undefined = undefined;
            const isFinalAnswer = !data.question;

            // Sanitize function to remove "undefined" artifacts from AI responses
            const sanitize = (text: string) => text?.replace(/[!.?,;:\s]*undefined\s*$/gi, '').trim() || "";

            if (data.question) {
                aiContent = sanitize(data.question);
            } else if (data.insight) {
                aiContent = sanitize(data.insight);

                // Append replies if present (for Flört Koçu persona)
                if (data.replies && Array.isArray(data.replies) && data.replies.length > 0) {
                    const repliesText = data.replies.map((r: string) => `\n${sanitize(r)}`).join('');
                    aiContent += repliesText;
                }

                risk = (data.risk_score !== null && data.risk_score !== undefined) ? data.risk_score : undefined;
            } else {
                aiContent = "Bağlantı sağlandı ancak analiz verisi eksik.";
            }

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content: aiContent,
                riskScore: risk,
                confidence: data.confidence_score,
                actionTrigger: data.action_trigger,
                intent: data.intent
            };

            if (isFinalAnswer) {
                let headline = "😐 Nötr Durum";
                if (risk !== undefined) {
                    if (risk > 75) headline = "💀 Toksik Alarmı";
                    else if (risk > 50) headline = "🚩 Kırmızı Bayraklar";
                    else if (risk > 25) headline = "🤔 Şüpheli Durum";
                    else headline = "✅ Güvenli Bölge";
                }

                const bullets = aiContent.split(/(?:- |\n\n|\. )/).filter(s => s.length > 10).slice(0, 3);

                setReadyResult({
                    headline: headline,
                    bullets: bullets.length ? bullets : [aiContent.substring(0, 50) + "..."],
                    advice: aiContent,
                    riskScore: risk || 50,
                    replies: (data as any).replies
                });

                // Check if this is a debatable scenario for jury sharing
                if (data.is_debatable === true) {
                    // Build content from chat history
                    const userMessages = messages.filter(m => m.role === 'user').map(m => m.content).join(' ');
                    const debateHook = sanitize(data.debate_hook || "Haklı mı haksız mı?");

                    setJuryPrompt({
                        show: true,
                        hook: debateHook,
                        content: userMessages.substring(0, 500) // Limit content length
                    });
                }

                setMessages((prev) => [...prev, aiMessage]);

            } else {
                setMessages((prev) => [...prev, aiMessage]);
                setLoadingProgress(85);
            }

            setIsLoading(false);
            setLoadingProgress(0);

            if (currentSessionId) {
                await supabase.from("messages").insert([{
                    session_id: currentSessionId,
                    role: "ai",
                    content: aiContent,
                    risk_score: risk,
                    confidence: data.confidence_score
                }]);
            }

        } catch (error) {
            clearInterval(progressInterval);
            console.error(error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content: `Hata oluştu: ${error}`,
            }
            setMessages((prev) => [...prev, errorMessage]);
            setIsLoading(false);
            setLoadingProgress(0);
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent overflow-hidden relative">
            <AuroraBackground isInteracting={isLoading} persona={selectedPersona} />

            <CreateConfessionModal
                isOpen={isConfessionModalOpen}
                onClose={() => setIsConfessionModalOpen(false)}
                onSuccess={() => setIsConfessionModalOpen(false)}
                defaultTitle={confessionDraft.title}
                defaultContent={confessionDraft.content}
            />

            {/* No Credits Modal */}
            <AnimatePresence>
                {showAdModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setShowAdModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
                                    <span className="text-3xl">⏳</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {locale === 'tr' ? 'Analiz Hakkın Bitti' : 'Out of Credits'}
                                </h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    {locale === 'tr'
                                        ? 'Günlük 3 ücretsiz analiz hakkını doldurdun. Hakların her gece yenilenir.'
                                        : 'You used up your 3 free daily credits. They reset every night.'}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        setShowAdModal(false);
                                        router.push('/confessions');
                                    }}
                                    className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-xl transition-transform active:scale-95 flex items-center justify-center gap-2 group"
                                >
                                    <span>⚖️</span>
                                    {locale === 'tr' ? 'Jüri Ol & Kredi Kazan' : 'Be Jury & Earn Credits'}
                                    <span className="bg-black/20 text-black/70 text-[10px] px-1.5 py-0.5 rounded font-bold ml-1">HEMEN</span>
                                </button>

                                <button
                                    onClick={() => setShowAdModal(false)}
                                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 rounded-xl transition-colors"
                                >
                                    {locale === 'tr' ? 'Bekleyeceğim' : 'I\'ll Wait'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {storyResult && (
                    <StoryResult
                        result={storyResult}
                        onClose={() => setStoryResult(null)}
                        onShare={handleShareStory}
                    />
                )}
            </AnimatePresence>

            <div className={cn(
                "flex-1 w-full min-h-0 overflow-y-auto px-3 pt-16 pb-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent relative z-10"
            )}>
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center px-2">

                        {user && auraPoints > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-2 bg-yellow-500/10 border border-yellow-500/20 px-3 py-0.5 rounded-full text-yellow-400 font-bold text-xs shadow-[0_0_15px_-3px_rgba(234,179,8,0.2)]"
                            >
                                💎 {auraPoints} Aura
                            </motion.div>
                        )}

                        {/* Compact App Title */}
                        <div className="mb-2 text-center">
                            <h1 className="text-xl sm:text-2xl font-bold text-white">
                                {tCommon('app_title')}
                            </h1>
                            <p className="text-indigo-400 font-medium text-xs">
                                {tCommon('app_tagline')}
                            </p>
                        </div>

                        <div className="w-full max-w-xs mb-2">
                            <PersonaSelector
                                selected={selectedPersona}
                                onSelect={setSelectedPersona}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Wizard - Shown on all devices now */}
                        <div className="w-full max-w-xs overflow-hidden">
                            <h3 className="text-zinc-500 text-[10px] mb-2 font-semibold tracking-wide text-center uppercase">{tWizard('title')}</h3>
                            <SituationWizard
                                key={`desktop-${selectedPersona}`}
                                graph={selectedPersona === 'taktik' ? FLIRT_GRAPH : PREDICTION_GRAPH}
                                onComplete={(promptKey) => {
                                    if (promptKey.includes('_')) {
                                        const translated = tWizard(`prompts.${promptKey}`);
                                        setInput(translated);
                                    } else {
                                        setInput(promptKey);
                                    }
                                }}
                                onReset={() => setInput("")}
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-6 max-w-3xl mx-auto">
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <div key={msg.id} className="flex flex-col gap-2 w-full">
                                <MessageBubble
                                    role={msg.role}
                                    content={msg.content}
                                    riskScore={msg.riskScore}
                                    confidence={msg.confidence}
                                    persona={selectedPersona}
                                    onReact={user ? async (reaction) => {
                                        await logFeedback(msg.id, reaction);
                                        if (refreshCredits) await refreshCredits();
                                    } : undefined}
                                    isLocked={false}
                                />
                                {msg.actionTrigger === 'TRIGGER_QUIZ' && (
                                    <QuizSuggestionCard intent={msg.intent || 'DISCOVERY'} />
                                )}
                                {msg.actionTrigger === 'TRIGGER_JURY' && (
                                    <JuryDraftCard
                                        intent={msg.intent || 'JUDGMENT'}
                                        draftContent={msg.content}
                                        onDraftOpen={() => {
                                            setConfessionDraft({
                                                title: "Jüriye Danışıyorum",
                                                content: msg.content
                                            });
                                            setIsConfessionModalOpen(true);
                                        }}
                                    />
                                )}
                            </div>
                        ))}
                    </AnimatePresence>
                    {isLoading && (
                        <div className="pb-4">
                            <RiskMeter
                                isLoading={isLoading}
                                score={null}
                                isVisible={true}
                                persona={selectedPersona}
                            />
                        </div>
                    )}

                    {/* Locked Analysis CTA for Guests */}
                    {!user && readyResult && !isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="py-6 px-2"
                        >
                            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center shadow-2xl relative overflow-hidden">
                                {/* Blurred Background Hint */}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10 pointer-events-none" />
                                <div className="absolute top-0 left-0 w-full h-full opacity-10 filter blur-sm pointer-events-none p-4 text-left text-xs text-zinc-500">
                                    Lorem ipsum dolor sit amet analysis hidden content red flags detected signals mixed interaction patterns toxic trait identification...
                                </div>

                                <div className="relative z-20">
                                    <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-2xl">🔒</span>
                                    </div>
                                    <h3 className="text-white font-bold text-lg mb-1">
                                        {locale === 'tr' ? 'Detaylı Analiz Kilitli' : 'Full Analysis Locked'}
                                    </h3>
                                    <p className="text-zinc-400 text-sm mb-4">
                                        {locale === 'tr'
                                            ? 'Yapay zeka 3 kritik risk faktörü ve 2 gizli niyet tespit etti. Görmek için ücretsiz giriş yap.'
                                            : 'AI detected 3 critical risk factors and 2 hidden intentions. Login for free to reveal.'}
                                    </p>
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-500/25"
                                    >
                                        <span>🔓</span>
                                        {locale === 'tr' ? 'Raporun Tamamını Gör (Ücretsiz)' : 'Reveal Full Report (Free)'}
                                    </Link>
                                    <p className="text-[10px] text-zinc-600 mt-3 uppercase tracking-wider font-bold">
                                        {locale === 'tr' ? '1 Dakikada Hızlı Giriş' : '1 Minute Fast Login'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Jury Share Prompt - Only shows for debatable scenarios */}
            <AnimatePresence>
                {juryPrompt?.show && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-28 left-4 right-4 z-40 max-w-md mx-auto"
                    >
                        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-amber-500/30 rounded-2xl p-4 shadow-2xl shadow-amber-500/10">
                            <div className="flex items-start gap-3">
                                <span className="text-3xl">⚖️</span>
                                <div className="flex-1">
                                    <p className="text-white font-bold text-sm mb-1">
                                        {juryPrompt.hook}
                                    </p>
                                    <p className="text-zinc-400 text-xs mb-3">
                                        {locale === 'tr'
                                            ? 'Bu durumu jüriye sun, binlerce kişi oyluyor!'
                                            : 'Let the jury decide! Thousands are voting.'}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setConfessionDraft({
                                                    title: juryPrompt.hook,
                                                    content: juryPrompt.content
                                                });
                                                setIsConfessionModalOpen(true);
                                                setJuryPrompt(null);
                                            }}
                                            className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold py-2 px-4 rounded-xl text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <span>🔥</span>
                                            {locale === 'tr' ? 'Jüriye Sun' : 'Submit to Jury'}
                                        </button>
                                        <button
                                            onClick={() => setJuryPrompt(null)}
                                            className="px-3 py-2 text-zinc-500 hover:text-white text-xs rounded-xl transition-colors"
                                        >
                                            {locale === 'tr' ? 'Vazgeç' : 'Skip'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative z-10">
                {/* Mobile Suggestion Bar - REMOVED to restore central view */}
                {/* 
                {showMobileSuggestions && (
                    <div className="md:hidden"> ... </div>
                )} 
                */}
                <InputArea
                    input={input}
                    setInput={setInput}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    onImageSelect={setSelectedImage}
                    selectedImage={selectedImage}
                    clearImage={() => setSelectedImage(null)}
                    onVoiceResponse={handleVoiceResponse}
                    history={messages}
                    personaId={selectedPersona}
                />
            </div>
        </div >
    );
}
