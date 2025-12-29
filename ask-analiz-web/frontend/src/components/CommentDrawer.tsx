"use client";

import { motion, AnimatePresence } from "framer-motion";
import { User, Send, X, ShieldAlert, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useTranslations } from "next-intl";

interface Comment {
    id: string;
    username: string;
    text: string;
    created_at: string;
    is_toxic_vote: boolean;
}

interface CommentDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    confessionId: string | number;
    aiScore: number;
    userScore?: number;
}

export default function CommentDrawer({ isOpen, onClose, confessionId, aiScore, userScore = 78 }: CommentDrawerProps) {
    const t = useTranslations('confession');
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [userVote, setUserVote] = useState<"toxic" | "safe" | null>(null);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);

    // Check auth and fetch comments when drawer opens
    useEffect(() => {
        if (isOpen) {
            fetchComments();
            checkUser();
        }
    }, [isOpen, confessionId]);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };

    const fetchComments = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("comments")
            .select("*")
            .eq("confession_id", confessionId)
            .order("created_at", { ascending: false })
            .limit(50);

        if (data) {
            setComments(data);
        }
        setLoading(false);
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return "Şimdi";
        if (diffMins < 60) return `${diffMins}dk`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}sa`;
        return `${Math.floor(diffMins / 1440)}g`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const comment = {
            confession_id: confessionId,
            user_id: user?.id || null,
            username: user?.email?.split('@')[0] || 'Anonim',
            text: newComment.trim(),
            is_toxic_vote: userVote === "toxic"
        };

        const { data, error } = await supabase
            .from("comments")
            .insert([comment])
            .select()
            .single();

        if (data) {
            setComments([data, ...comments]);
            setNewComment("");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 h-[60vh] bg-zinc-900 border-t border-zinc-800 rounded-t-3xl z-50 flex flex-col shadow-2xl"
                    >
                        {/* Drag Handle + Close Button */}
                        <div className="w-full flex justify-between items-center px-4 pt-4 pb-2">
                            <div className="w-10" />
                            <div className="w-12 h-1.5 bg-zinc-700 rounded-full cursor-pointer" onClick={onClose} />
                            <button
                                onClick={onClose}
                                className="w-10 h-10 bg-zinc-800 rounded-full text-zinc-400 hover:text-white flex items-center justify-center active:scale-95 transition-transform"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Header */}
                        <div className="px-6 pb-4 border-b border-zinc-800">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <span className="text-indigo-500">#</span> {t('comments')}
                            </h2>
                        </div>

                        {/* Comment List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {loading ? (
                                <div className="text-center text-zinc-500 py-8">Yükleniyor...</div>
                            ) : comments.length === 0 ? (
                                <div className="text-center text-zinc-500 py-8">Henüz yorum yok. İlk yorumu sen yap!</div>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0 border border-zinc-700">
                                            <User size={14} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold text-zinc-300">{comment.username}</span>
                                                <span className="text-[10px] text-zinc-600 font-medium">{formatTime(comment.created_at)}</span>
                                                {comment.is_toxic_vote !== undefined && (
                                                    <span className={cn(
                                                        "text-[10px] px-1.5 py-0.5 rounded uppercase font-bold",
                                                        comment.is_toxic_vote ? "bg-red-900/30 text-red-500" : "bg-emerald-900/30 text-emerald-500"
                                                    )}>
                                                        {comment.is_toxic_vote ? "TOKSİK" : "GÜVENLİ"}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-zinc-400 leading-relaxed bg-zinc-800/40 p-2 rounded-lg rounded-tl-none">
                                                {comment.text}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-zinc-800 bg-zinc-900">
                            {/* Quick Vote Buttons */}
                            <div className="flex gap-2 mb-3">
                                <button
                                    onClick={() => setUserVote("safe")}
                                    className={cn(
                                        "flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all",
                                        userVote === "safe" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20" : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"
                                    )}
                                >
                                    <ShieldCheck size={14} /> {t('valid')}
                                </button>
                                <button
                                    onClick={() => setUserVote("toxic")}
                                    className={cn(
                                        "flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all",
                                        userVote === "toxic" ? "bg-red-600 text-white shadow-lg shadow-red-900/20" : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"
                                    )}
                                >
                                    <ShieldAlert size={14} /> {t('trouble')}
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Fikrini belirt..."
                                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                                />
                                <button
                                    type="submit"
                                    disabled={!newComment.trim()}
                                    className="p-3 bg-indigo-600 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-500 transition-colors"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
