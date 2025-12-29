"use client";

import { useState, useRef } from "react";
import { Mic, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface VoiceVentProps {
    onTranscript: (userText: string, aiText: string, audioBase64: string) => void;
    disabled?: boolean;
    history?: any[];
    personaId?: string;
}

export default function VoiceVent({ onTranscript, disabled, history = [], personaId = 'dedektif' }: VoiceVentProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        if (disabled || isProcessing) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                setIsRecording(false);
                setIsProcessing(true);
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

                // Send to Backend
                const formData = new FormData();
                formData.append("audio", blob);
                formData.append("persona", personaId);
                formData.append("history", JSON.stringify(history));

                try {
                    const res = await fetch("/api/voice", {
                        method: "POST",
                        body: formData
                    });

                    const data = await res.json();

                    if (data.error) throw new Error(data.error);

                    if (data.user_text && data.ai_text) {
                        onTranscript(data.user_text, data.ai_text, data.audio_base64);
                    }

                } catch (error) {
                    console.error("Voice Error:", error);
                    alert("Ses işlenirken bir hata oluştu.");
                } finally {
                    setIsProcessing(false);
                    // Stop tracks
                    stream.getTracks().forEach(track => track.stop());
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            if (navigator.vibrate) navigator.vibrate(50);

        } catch (err) {
            console.error("Mic access denied:", err);
            alert("Mikrofona erişilemedi.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            if (navigator.vibrate) navigator.vibrate([30, 30]);
        }
    };

    return (
        <div className="relative">
            {/* Visual Feedback Overlay (Expands when holding) */}
            <AnimatePresence>
                {isRecording && (
                    <motion.div
                        initial={{ scale: 1, opacity: 0.5 }}
                        animate={{ scale: 3, opacity: 0 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute inset-0 bg-red-500 rounded-xl"
                    />
                )}
            </AnimatePresence>

            <button
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onMouseLeave={stopRecording} // Stop if dragged out
                onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
                onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
                disabled={disabled || isProcessing}
                className={cn(
                    "relative z-10 p-2 rounded-xl transition-all duration-200",
                    isRecording
                        ? "bg-red-500/20 text-red-500 scale-110"
                        : isProcessing
                            ? "bg-indigo-500/20 text-indigo-400 animate-pulse"
                            : "text-zinc-500 hover:text-white hover:bg-zinc-700/50"
                )}
            >
                {isProcessing ? <AlertCircle size={20} className="animate-spin" /> : <Mic size={20} className={cn(isRecording && "animate-pulse")} />}
            </button>

            {/* Tooltip hint if not recording */}
            {!isRecording && !isProcessing && !disabled && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    <span className="text-[10px] bg-black/80 px-2 py-1 rounded text-zinc-400">Bas konuş</span>
                </div>
            )}
        </div>
    );
}
