"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Plus, ChevronLeft, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ChatSession {
    id: string;
    title: string;
    created_at: string;
}

interface ChatSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
    const t = useTranslations('sidebar');
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSessionId = searchParams.get("session");
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchUserAndSessions = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const { data } = await supabase
                    .from("chat_sessions")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false });
                if (data) setSessions(data);

                const channel = supabase.channel('chat_sessions_changes')
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_sessions', filter: `user_id=eq.${user.id}` }, (payload) => {
                        if (payload.eventType === 'INSERT') setSessions((prev) => [payload.new as ChatSession, ...prev]);
                        else if (payload.eventType === 'DELETE') setSessions((prev) => prev.filter((s) => s.id !== payload.old.id));
                    })
                    .subscribe();
                return () => { supabase.removeChannel(channel); };
            }
        };
        fetchUserAndSessions();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user);
            if (!session) setSessions([]);
        });
        return () => subscription.unsubscribe();
    }, []);

    const createNewChat = async () => {
        router.push("/");
        onClose();
    };

    const deleteSession = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(t('delete_confirm'))) return;
        const { error } = await supabase.from("chat_sessions").delete().eq("id", id);
        if (!error) {
            setSessions(sessions.filter(s => s.id !== id));
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
                        className="fixed inset-0 z-[60] backdrop-blur-sm bg-black/80"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed top-0 left-0 h-[100dvh] w-72 border-r flex flex-col z-[70] shadow-2xl bg-zinc-900 border-zinc-800"
                    >
                        <div className="p-4 flex items-center justify-between border-b border-zinc-800">
                            <span className="text-xl font-bold tracking-tight text-white">
                                {t('history')}
                            </span>
                            <button onClick={onClose} className="text-zinc-500 hover:text-white">
                                <ChevronLeft size={24} />
                            </button>
                        </div>

                        <div className="p-4">
                            <button
                                onClick={createNewChat}
                                className="w-full flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-3 rounded-xl transition-colors font-medium mb-2 shadow-lg shadow-indigo-500/20"
                            >
                                <Plus size={18} />
                                {t('new_analysis')}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1 scrollbar-thin scrollbar-thumb-zinc-800">
                            {sessions.length === 0 ? (
                                <div className="text-center text-sm py-4 text-zinc-500">
                                    {t('no_history')}
                                </div>
                            ) : (
                                sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className={cn(
                                            "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                                            currentSessionId === session.id
                                                ? "bg-zinc-800 text-white"
                                                : "text-zinc-300 hover:bg-zinc-800/50 hover:text-white"
                                        )}
                                        onClick={() => {
                                            router.push(`/?session=${session.id}`);
                                            onClose();
                                        }}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <MessageSquare size={16} className={cn("shrink-0", currentSessionId === session.id ? "text-indigo-500" : "")} />
                                            <span className="truncate text-sm">{session.title}</span>
                                        </div>
                                        <button
                                            onClick={(e) => deleteSession(session.id, e)}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t flex flex-col gap-3 border-zinc-800">
                            <div className="flex gap-3 text-[10px] font-medium text-zinc-600">
                                <a href="/privacy" className="transition-colors hover:text-zinc-400">
                                    Privacy
                                </a>
                                <a href="/terms" className="transition-colors hover:text-zinc-400">
                                    Terms
                                </a>
                            </div>

                            {user && (
                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold bg-zinc-800 text-white">
                                        {user.email?.[0].toUpperCase()}
                                    </div>
                                    <span className="truncate max-w-[150px]">{user.email}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
