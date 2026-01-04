"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Bell, Check, Trash2, Loader2, MessageCircle } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
    id: string;
    type: 'vote' | 'system' | 'reward';
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

export default function NotificationsList({ userId }: { userId: string }) {
    const locale = useLocale() as 'tr' | 'en';
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (data) setNotifications(data);
        setLoading(false);
    };

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    };

    const deleteNotification = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setNotifications(prev => prev.filter(n => n.id !== id));
        await supabase.from('notifications').delete().eq('id', id);
    };

    const markAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
    };

    useEffect(() => {
        fetchNotifications();

        // Subscription for real-time updates
        const channel = supabase
            .channel('realtime-notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`
            }, (payload) => {
                setNotifications(prev => [payload.new as Notification, ...prev]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId]);

    if (loading) return null; // Silent loading to not disrupt profile layout excessively

    if (notifications.length === 0) return null;

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                    <Bell size={12} className={unreadCount > 0 ? "text-amber-500 animate-pulse" : ""} />
                    {locale === 'tr' ? 'Bildirimler' : 'Notifications'}
                    {unreadCount > 0 && (
                        <span className="bg-amber-500 text-black text-[10px] px-1.5 rounded-full font-bold">
                            {unreadCount}
                        </span>
                    )}
                </h2>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllRead}
                        className="text-[10px] text-zinc-500 hover:text-indigo-400 flex items-center gap-1"
                    >
                        <Check size={10} />
                        {locale === 'tr' ? 'Hepsini Oku' : 'Mark all read'}
                    </button>
                )}
            </div>

            <div className="space-y-2">
                <AnimatePresence initial={false}>
                    {notifications.map((n) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`relative p-3 rounded-xl border border-zinc-800 transition-colors ${n.is_read ? 'bg-zinc-900/40 opacity-70' : 'bg-zinc-900 border-indigo-500/30'
                                }`}
                            onClick={() => !n.is_read && markAsRead(n.id)}
                        >
                            <div className="flex gap-3">
                                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.is_read ? 'bg-zinc-700' : 'bg-amber-500'
                                    }`} />
                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-sm font-medium leading-none mb-1 ${n.is_read ? 'text-zinc-400' : 'text-white'
                                        }`}>
                                        {n.title}
                                    </h4>
                                    <p className="text-xs text-zinc-500 truncate">
                                        {n.message}
                                    </p>
                                    <p className="text-[10px] text-zinc-600 mt-1">
                                        {new Date(n.created_at).toLocaleTimeString(locale === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => deleteNotification(n.id, e)}
                                    className="self-start text-zinc-600 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
