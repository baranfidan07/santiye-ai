"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import MessageBubble from "./MessageBubble";
import InputArea from "./InputArea";
import CreateConfessionModal from "./CreateConfessionModal"; // Repurposed for Reports
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";

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
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("session");

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    // Dayı Mode: No selection needed
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportDraft, setReportDraft] = useState({ title: "", content: "" });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleVoiceResponse = (userText: string, aiText: string, audioBase64: string) => {
        const tempId = Date.now().toString();
        const userMsg: Message = { id: tempId, role: "user", content: userText };
        setMessages(prev => [...prev, userMsg]);

        if (audioBase64) {
            try {
                const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
                audio.play();
            } catch (e) {
                console.error("Audio playback failed", e);
            }
        }

        const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: "ai",
            content: aiText,
            confidence: 90
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
    }, []);

    useEffect(() => {
        if (!sessionId) {
            setMessages([]);
            return;
        }

        const fetchMessages = async () => {
            const { data } = await supabase
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
                }));
                setMessages(mapped);
            }
        };

        fetchMessages();
    }, [sessionId]);

    const handleCreateReport = async () => {
        // Generate valid formal report from chat
        if (messages.length < 2) return;

        setIsLoading(true);
        const conversationContext = messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
        }));

        try {
            const res = await fetch("/api/generate-report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: conversationContext })
            });

            const data = await res.json();
            setReportDraft({
                title: "Vaka Raporu #" + Math.floor(Math.random() * 1000),
                content: data.report_text || "Rapor oluşturulamadı."
            });
            setIsReportModalOpen(true);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if ((!input.trim() && !selectedImage) || isLoading) return;

        setIsLoading(true);

        const currentInput = input;
        const currentImage = selectedImage;
        const aiPrompt = currentInput;

        setInput("");
        setSelectedImage(null);

        // Auto-create session if guest
        let currentSessionId = sessionId;
        if (!currentSessionId && user) {
            const title = currentInput.substring(0, 30) || "Yeni Şantiye Kaydı";
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

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: currentInput + (currentImage ? " [Görsel Eklendi]" : ""),
        };

        setMessages((prev) => [...prev, userMessage]);

        if (currentSessionId && user) {
            await supabase.from("messages").insert([{
                session_id: currentSessionId,
                role: "user",
                content: userMessage.content
            }]);
        }

        try {
            // Simplified API Call - No Persona Selection
            const conversationHistory = messages.map(m => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.content
            }));
            conversationHistory.push({ role: 'user', content: aiPrompt });

            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: conversationHistory,
                    system_prompt: null // Backend handles fallback to "Santiye AI"
                }),
            });

            const data = await response.json();
            let aiContent = data.insight || data.question || "Hat çekmiyor şefim...";

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content: aiContent,
                riskScore: data.risk_score
            };

            setMessages((prev) => [...prev, aiMessage]);

            if (currentSessionId && user) {
                await supabase.from("messages").insert([{
                    session_id: currentSessionId,
                    role: "ai",
                    content: aiContent,
                    risk_score: aiMessage.riskScore
                }]);
            }

        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "ai",
                content: `Bağlantı koptu şefim: ${error}`,
            }
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0a0a] overflow-hidden relative">

            {/* Simple Report Modal reusing Confession Modal UI */}
            <CreateConfessionModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                onSuccess={() => setIsReportModalOpen(false)}
                defaultTitle={reportDraft.title}
                defaultContent={reportDraft.content}
            />

            <div className={cn(
                "flex-1 w-full min-h-0 overflow-y-auto px-3 pt-16 pb-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent relative z-10"
            )}>
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center px-2">
                        <div className="mb-4 text-center animate-pulse">
                            <span className="text-6xl">🏗️</span>
                        </div>
                        <h1 className="text-3xl font-bold text-[#ff6d00] mb-2 uppercase tracking-wide">
                            Şantiye AI
                        </h1>
                        <p className="text-zinc-400 font-medium text-lg max-w-xs">
                            "Şantiyedeki sağ kolun. Sorunu söyle, çözümü al."
                        </p>

                        <div className="mt-8 p-4 bg-zinc-900 rounded-lg border border-zinc-800 border-l-4 border-l-[#ff6d00]">
                            <p className="text-zinc-300 text-sm">Örnek: "10 torba çimento eksik, ne yapayım?"</p>
                        </div>
                    </div>
                )}

                <div className="space-y-6 max-w-3xl mx-auto pb-24">
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <div key={msg.id} className="flex flex-col gap-2 w-full">
                                <MessageBubble
                                    role={msg.role}
                                    content={msg.content}
                                    riskScore={msg.riskScore}
                                    confidence={msg.confidence}
                                    persona="taktik" // Reusing text styling
                                    isLocked={false}
                                />
                            </div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <div className="flex items-center justify-center p-4">
                            <div className="w-3 h-3 bg-[#ff6d00] rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                            <div className="w-3 h-3 bg-[#ff6d00] rounded-full animate-bounce mx-1" style={{ animationDelay: "0.1s" }} />
                            <div className="w-3 h-3 bg-[#ff6d00] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                        </div>
                    )}
                </div>
                <div ref={messagesEndRef} />
            </div>

            <InputArea
                input={input}
                setInput={setInput}
                isLoading={isLoading}
                onSubmit={handleSubmit}
                onImageSelect={setSelectedImage}
                selectedImage={selectedImage}
                clearImage={() => setSelectedImage(null)}
                onVoiceResponse={handleVoiceResponse}
            // placeholder removed as it's not in the interface, handled by component internal translation
            />
        </div>
    );
}
