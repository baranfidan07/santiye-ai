"use client";

import { useRef, useEffect, useState } from "react";
import { Send, Image as ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import VoiceVent from "./VoiceVent";
import { useTranslations } from "next-intl";

interface InputAreaProps {
    input: string;
    setInput: (value: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
    onImageSelect: (base64: string) => void;
    selectedImage: string | null;
    clearImage: () => void;
    onVoiceResponse?: (userText: string, aiText: string, audioBase64: string) => void;
    history?: any[];
    personaId?: string;
}

export default function InputArea({ input, setInput, onSubmit, isLoading, onImageSelect, selectedImage, clearImage, onVoiceResponse, history, personaId }: InputAreaProps) {
    const t = useTranslations('chat');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [input]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onImageSelect(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVoiceTranscript = (userText: string, aiText: string, audioBase64: string) => {
        // Pass everything up to ChatInterface
        onVoiceResponse?.(userText, aiText, audioBase64);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
        }
    };

    return (
        <div className="w-full relative z-20 pb-6 pt-2">
            <div className="max-w-2xl mx-auto backdrop-blur-xl border-t rounded-t-[2.5rem] shadow-2xl overflow-hidden bg-zinc-900/60 border-white/5">
                <div className="px-4 pb-2 pt-4">
                    {selectedImage && (
                        <div className="relative w-fit mb-3">
                            <img src={selectedImage} alt="Preview" className="h-24 rounded-2xl border shadow-lg object-cover border-white/10" />
                            <button
                                onClick={clearImage}
                                className="absolute -top-2 -right-2 rounded-full p-1.5 border shadow-lg bg-zinc-800 text-zinc-400 hover:text-white border-zinc-700"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    <div className="relative group">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder={t('input_placeholder')}
                            rows={1}
                            className="w-full bg-transparent border-none resize-none focus:outline-none focus:ring-0 text-lg font-medium p-2 min-h-[60px] max-h-48 text-white placeholder:text-zinc-500/50"
                        />

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-3 rounded-full transition-all text-zinc-400 hover:text-purple-400 hover:bg-purple-500/10"
                                >
                                    <ImageIcon size={22} strokeWidth={2} />
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </button>
                                <VoiceVent
                                    onTranscript={handleVoiceTranscript}
                                    disabled={isLoading}
                                    history={history}
                                    personaId={personaId}
                                />
                            </div>

                            <button
                                onClick={onSubmit}
                                disabled={(!input.trim() && !selectedImage) || isLoading}
                                className={cn(
                                    "relative overflow-hidden group flex items-center gap-2 pl-6 pr-4 py-3 rounded-full font-bold text-sm transition-all duration-300",
                                    (!input.trim() && !selectedImage)
                                        ? "bg-zinc-800 text-zinc-500 opacity-50 cursor-not-allowed"
                                        : "bg-indigo-500 text-white hover:scale-105 shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                                )}
                            >
                                <span className="uppercase tracking-wider">{t('analyze_btn')}</span>
                                <div className="bg-white/20 p-1.5 rounded-full">
                                    <Send size={16} className="-ml-0.5 mt-0.5 skew-x-1" />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
