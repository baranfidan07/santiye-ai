"use client";

import { m, useSpring, useTransform, animate } from "framer-motion";
import { useState, useEffect, memo } from "react";
import { cn } from "@/lib/utils";
import { Fingerprint, Sparkles, Activity, ChevronDown } from "lucide-react";
import CommentDrawer from "./CommentDrawer";
import { useTranslations, useLocale } from "next-intl";
import { getVoteType, DEFAULT_VOTE_TYPE } from "@/lib/voteTypes";

import { track } from '@vercel/analytics';

interface ConfessionCardProps {
    id: string | number;
    hook: string;
    fullStory: string;
    toxicScore: number;
    juryScore?: number;
    category?: string;
    voteType?: string; // Dynamic vote type ID
    likeCount?: number;
    dislikeCount?: number;
    forceDrawerOpen?: boolean;
    onDrawerClose?: () => void;
}

function CountingNumber({ value, isVisible }: { value: number, isVisible: boolean }) {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        if (isVisible) {
            const controls = animate(0, value, {
                duration: 1.5,
                ease: "circOut",
                onUpdate: (latest) => setDisplayValue(Math.floor(latest))
            });
            return () => controls.stop();
        } else {
            setDisplayValue(0);
        }
    }, [value, isVisible]);

    const getColor = (val: number) => {
        if (val > 80) return "text-red-500";
        if (val > 50) return "text-orange-400";
        return "text-emerald-400";
    };

    return (
        <span className={cn("text-lg font-black block transition-colors duration-300", getColor(displayValue))}>
            %{displayValue}
        </span>
    );
}

const ConfessionCard = memo(function ConfessionCard({ id, hook, fullStory, toxicScore, juryScore = 0, category = "İlişki", voteType = DEFAULT_VOTE_TYPE, likeCount = 0, dislikeCount = 0, forceDrawerOpen, onDrawerClose }: ConfessionCardProps) {
    const t = useTranslations('confession');
    const tCommon = useTranslations('common');
    const locale = useLocale() as 'tr' | 'en';
    const [isFlipped, setIsFlipped] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [liked, setLiked] = useState(false);
    const [currentLikeCount, setCurrentLikeCount] = useState(likeCount);
    const [currentDislikeCount, setCurrentDislikeCount] = useState(dislikeCount);
    // Removed viewerCount as it was mocking the ratio base

    // Sync props
    useEffect(() => {
        setCurrentLikeCount(likeCount);
        setCurrentDislikeCount(dislikeCount);
    }, [likeCount, dislikeCount]);

    // Check localStorage for liked status
    // Note: We only track "liked" state locally for now. Dislikes are fire-and-forget in the feed.
    useEffect(() => {
        const likedConfessions = JSON.parse(localStorage.getItem('likedConfessions') || '[]');
        if (likedConfessions.includes(String(id))) {
            setLiked(true);
        }
    }, [id]);

    // Handle like with persistence
    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const likedConfessions = JSON.parse(localStorage.getItem('likedConfessions') || '[]');

        if (liked) {
            // Unlike
            const updated = likedConfessions.filter((cid: string) => cid !== String(id));
            localStorage.setItem('likedConfessions', JSON.stringify(updated));
            setLiked(false);
            setCurrentLikeCount(prev => Math.max(0, prev - 1));
            // Decrement in DB (fire and forget)
            const { supabase } = await import('@/lib/supabase');
            await supabase.rpc('decrement_like', { confession_id: id });
        } else {
            // Like
            likedConfessions.push(String(id));
            localStorage.setItem('likedConfessions', JSON.stringify(likedConfessions));
            setLiked(true);
            setCurrentLikeCount(prev => prev + 1);
            // Increment in DB (fire and forget)
            const { supabase } = await import('@/lib/supabase');
            await supabase.rpc('increment_like', { confession_id: id });
        }
    };

    // Story Expansion Logic
    const [isExpanded, setIsExpanded] = useState(false);



    // --- RATIO CALCULATION START ---
    const totalVotes = currentLikeCount + currentDislikeCount;
    // Default to 50/50 visual if no votes yet to look balanced, or 0/0. Let's do 50/50 for bar but 0% text.
    const safeTotal = totalVotes === 0 ? 1 : totalVotes;

    const likePercentage = totalVotes === 0 ? 50 : Math.round((currentLikeCount / safeTotal) * 100);
    const dislikePercentage = totalVotes === 0 ? 50 : Math.round((currentDislikeCount / safeTotal) * 100);
    // --- RATIO CALCULATION END ---

    return (
        <div
            className="w-full max-w-xs h-[60vh] flex items-center justify-center relative mx-auto px-6"
            style={{
                perspective: '1000px',
                WebkitPerspective: '1000px',
            }}
        >
            <m.div
                className="relative w-full h-full cursor-pointer"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                onClick={() => {
                    if (!isFlipped) track('flip_card', { id: String(id) });
                    setIsFlipped(!isFlipped);
                }}
                style={{
                    transformStyle: 'preserve-3d',
                    WebkitTransformStyle: 'preserve-3d',
                    willChange: 'transform'
                }}
            >
                {/* --- FRONT FACE (THE HOOK) --- */}
                <div
                    className="absolute inset-0 w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-900 to-black rounded-3xl border border-zinc-800 shadow-2xl flex flex-col justify-between px-6 py-8 overflow-hidden"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(0deg)',
                        WebkitTransform: 'rotateY(0deg)'
                    }}
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />

                    {/* Top Section: Badge & Live Count */}
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="flex gap-2">
                            <span className="bg-zinc-800/90 border border-zinc-700 text-zinc-300 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                #{category}
                            </span>
                        </div>

                        <Fingerprint className="text-zinc-700 opacity-50" size={32} />
                    </div>

                    {/* THE HOOK (Main Content) */}
                    <div className="relative z-10 flex-1 flex flex-col justify-center gap-8 py-4">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-snug drop-shadow-xl font-sans tracking-tight">
                            "{hook}"
                        </h2>
                    </div>

                    {/* Bottom CTA - Comments & Hint */}
                    <div className="relative z-10 flex flex-col items-center gap-4 pt-4 pb-4">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                track('open_comments', { id: String(id), location: 'front' });
                                setIsDrawerOpen(true);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-full shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-transform active:scale-95"
                        >
                            💬 {locale === 'tr' ? 'Yorumlar' : 'Comments'}
                        </button>

                        <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                            {locale === 'tr' ? '(Detaylar için dokun)' : '(Tap for details)'}
                        </span>
                    </div>
                </div>

                {/* --- BACK FACE (THE VERDICT) --- */}
                <div
                    className="absolute inset-0 w-full h-full bg-zinc-950 rounded-3xl border border-red-900/30 shadow-2xl p-8 flex flex-col overflow-y-auto scrollbar-hide"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        WebkitTransform: 'rotateY(180deg)'
                    }}
                >
                    {/* PK Vote Visualization (TikTok Style) */}
                    <div className="w-full mb-6 relative group">
                        {(() => {
                            // Get dynamic vote type config
                            const vt = getVoteType(voteType);
                            const voteConfig = {
                                right: {
                                    label: `${vt.emoji.positive} ${vt.labelPositive[locale]}`,
                                    color: "text-emerald-500",
                                    gradient: "from-emerald-600 to-emerald-500"
                                },
                                left: {
                                    label: `${vt.emoji.negative} ${vt.labelNegative[locale]}`,
                                    color: "text-red-500",
                                    gradient: "from-red-600 to-red-500"
                                }
                            };

                            return (
                                <>
                                    <div className="flex justify-between items-end mb-2 px-1">
                                        {/* Left Side (Red Flag / Haksız) */}
                                        <div className="flex flex-col items-start gap-1">
                                            <span className={`text-[10px] font-bold ${voteConfig.left.color} tracking-widest uppercase flex items-center gap-1`}>
                                                {voteConfig.left.label}
                                            </span>
                                            <span className="text-2xl font-black text-white tabular-nums leading-none">
                                                {dislikePercentage}%
                                            </span>
                                        </div>

                                        {/* Right Side (Green Flag / Haklı) */}
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`text-[10px] font-bold ${voteConfig.right.color} tracking-widest uppercase flex items-center gap-1`}>
                                                {voteConfig.right.label}
                                            </span>
                                            <span className="text-2xl font-black text-white tabular-nums leading-none">
                                                {likePercentage}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Bar Container - with VS badge at junction */}
                                    <div className="relative">
                                        <div className="h-4 w-full bg-zinc-800 rounded-full overflow-hidden flex shadow-inner">
                                            {/* Red Bar (Left) */}
                                            <m.div
                                                className={`h-full bg-gradient-to-r ${voteConfig.left.gradient} relative`}
                                                initial={{ width: "50%" }}
                                                animate={{ width: `${dislikePercentage}%` }}
                                                transition={{ type: "spring", stiffness: 100 }}
                                            >
                                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:10px_10px]" />
                                            </m.div>

                                            {/* Green Bar (Right) */}
                                            <m.div
                                                className={`h-full flex-1 bg-gradient-to-l ${voteConfig.right.gradient} relative`}
                                            >
                                                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:10px_10px]" />
                                            </m.div>
                                        </div>

                                        {/* VS Badge - centered at the junction point */}
                                        <m.div
                                            className="absolute top-1/2 -translate-y-1/2 z-10 bg-zinc-900 border-2 border-zinc-700 rounded-full w-8 h-8 flex items-center justify-center font-black text-[10px] text-zinc-400 shadow-xl"
                                            animate={{ left: `calc(${dislikePercentage}% - 16px)` }}
                                            transition={{ type: "spring", stiffness: 100 }}
                                        >
                                            VS
                                        </m.div>
                                    </div>
                                </>
                            );
                        })()}

                        <div className="flex justify-between mt-1 px-1 opacity-50">
                            <span className="text-[9px] font-mono text-zinc-500">
                                {currentDislikeCount} Oy
                            </span>
                            <span className="text-[9px] font-mono text-zinc-500">
                                {currentLikeCount} Oy
                            </span>
                        </div>
                    </div>

                    {/* Full Story Section (EXPANDABLE) - NOW ON TOP */}
                    <div className="relative mb-6">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">{t('full_story')}</h4>
                        <div className="relative">
                            <p className={cn(
                                "text-zinc-400 text-sm leading-relaxed border-l-2 border-zinc-800 pl-3 transition-all duration-300",
                                !isExpanded && "line-clamp-3"
                            )}>
                                {fullStory}
                            </p>

                            {/* Gradient Overlay when collapsed */}
                            {!isExpanded && (
                                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
                            )}
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                            className="text-sm font-bold text-indigo-400 mt-3 py-2 px-4 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center gap-2 hover:bg-indigo-500/20 hover:border-indigo-500/50 active:scale-95 transition-all duration-200"
                        >
                            {isExpanded ? (
                                <>{t('show_less')}</>
                            ) : (
                                <>{t('read_more')} <ChevronDown size={16} /></>
                            )}
                        </button>
                    </div>



                    <div className="mt-6">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
                            className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors border border-zinc-800"
                        >
                            ↩ {locale === 'tr' ? 'Ön Yüze Dön' : 'Flip Back'}
                        </button>
                    </div>
                </div>
            </m.div>

            {/* --- JURY ROOM DRAWER --- */}
            <CommentDrawer
                isOpen={forceDrawerOpen || isDrawerOpen}
                onClose={() => {
                    setIsDrawerOpen(false);
                    onDrawerClose?.();
                }}
                confessionId={id}
                aiScore={toxicScore}
                userScore={juryScore}
            />
        </div>
    );
});

export default ConfessionCard;
