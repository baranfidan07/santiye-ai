"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, ThumbsUp, ThumbsDown, MessageSquare, Share2, Trash2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { getVoteType, DEFAULT_VOTE_TYPE } from "@/lib/voteTypes";

interface Confession {
    id: string;
    content: string;
    like_count: number;
    dislike_count: number;
    vote_type: string;
    created_at: string;
    toxic_score: number;
}

export default function UserConfessionsList({ userId }: { userId: string }) {
    const t = useTranslations('profile');
    const tVote = useTranslations('vote_types');
    const locale = useLocale() as 'tr' | 'en';
    const [confessions, setConfessions] = useState<Confession[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchConfessions = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('confessions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (data) {
            setConfessions(data);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(locale === 'tr' ? 'Silmek istediğine emin misin?' : 'Are you sure you want to delete?')) return;

        const { error } = await supabase.from('confessions').delete().eq('id', id);
        if (!error) {
            setConfessions(prev => prev.filter(c => c.id !== id));
        }
    };

    useEffect(() => {
        fetchConfessions();
    }, [userId]);

    if (loading) return <div className="py-8 text-center"><Loader2 className="animate-spin mx-auto text-zinc-600" /></div>;

    if (confessions.length === 0) {
        return (
            <div className="bg-zinc-900/50 rounded-xl p-6 text-center border border-zinc-800 border-dashed">
                <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="text-zinc-500" />
                </div>
                <h3 className="text-zinc-400 font-medium text-sm">{t('no_confessions')}</h3>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                <Share2 size={12} />
                {t('my_confessions_title')}
            </h2>

            <div className="grid gap-3">
                {confessions.map((confession) => {
                    const totalVotes = (confession.like_count || 0) + (confession.dislike_count || 0);
                    const likeRatio = totalVotes > 0 ? Math.round((confession.like_count / totalVotes) * 100) : 0;
                    const vt = getVoteType(confession.vote_type || DEFAULT_VOTE_TYPE);

                    const hook = confession.content.split('\n')[0].substring(0, 60) + "...";

                    return (
                        <div key={confession.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 relative group">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-white font-medium text-sm pr-6 leading-snug">{hook}</h3>
                                <button
                                    onClick={() => handleDelete(confession.id)}
                                    className="text-zinc-600 hover:text-red-400 transition-colors p-1"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            {/* Scoreboard */}
                            <div className="bg-black/40 rounded-lg p-3">
                                <div className="flex items-center justify-between text-xs mb-2">
                                    <span className="text-zinc-400 font-medium flex items-center gap-1">
                                        {vt.emoji.positive} {vt.labelPositive[locale]}
                                    </span>
                                    <span className="text-zinc-500 font-bold">{totalVotes} {t('votes')}</span>
                                    <span className="text-zinc-400 font-medium flex items-center gap-1">
                                        {vt.labelNegative[locale]} {vt.emoji.negative}
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                                    <div
                                        className="h-full bg-emerald-500 transition-all duration-1000"
                                        style={{ width: `${likeRatio}%` }}
                                    />
                                    <div
                                        className="h-full bg-red-500 transition-all duration-1000"
                                        style={{ width: `${100 - likeRatio}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1 text-[10px] font-bold">
                                    <span className="text-emerald-500">%{likeRatio}</span>
                                    <span className="text-red-500">%{100 - likeRatio}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
