"use client";

import { useRef, useState, useEffect } from "react";
import ConfessionCard from "./ConfessionCard";
import { supabase } from "@/lib/supabase";
import { m, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { X, Heart, MessageCircle, LogIn } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { getVoteType, DEFAULT_VOTE_TYPE } from "@/lib/voteTypes";
import { cn } from "@/lib/utils";
import { useRouter } from "@/i18n/routing";
import { Plus } from "lucide-react";
import CreateConfessionModal from "./CreateConfessionModal";

interface Confession {
    id: string;
    content: string;
    category: string;
    toxic_score: number;
    like_count: number;
    dislike_count: number;
    created_at: string;
    locale?: string;
    vote_type?: string;
}

interface ConfessionFeedProps {
    initialConfessions?: Confession[];
}

import { track } from '@vercel/analytics';
import { useCredits } from "@/contexts/CreditsContext";

export default function ConfessionFeed({ initialConfessions = [] }: ConfessionFeedProps) {
    const t = useTranslations('confession');
    const tCommon = useTranslations('common');
    const locale = useLocale();
    const router = useRouter();
    const [confessions, setConfessions] = useState<Confession[]>(initialConfessions);
    const [loading, setLoading] = useState(initialConfessions.length === 0);
    const [user, setUser] = useState<any>(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [pendingVote, setPendingVote] = useState<{ id: string; dir: 'left' | 'right' } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Credit System Logic
    const { addReward } = useCredits();
    const [voteProgress, setVoteProgress] = useState(0);
    const [lastCardTime, setLastCardTime] = useState(Date.now());
    const [showToast, setShowToast] = useState<{ message: string, type: 'success' | 'warning' } | null>(null);

    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => setShowToast(null), 2000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    // Fetch user and confessions
    useEffect(() => {
        const fetchData = async () => {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            // If we have initial confessions, we don't need to fetch immediately
            // But we might want to fetch if the locale changes and we are client-side navigation
            if (confessions.length === 0) {
                setLoading(true);
                const { data, error } = await supabase
                    .from("confessions")
                    .select("*")
                    .eq("locale", locale)
                    .order("created_at", { ascending: false })
                    .limit(50);

                if (data) {
                    setConfessions(data);
                }
                setLoading(false);
            }
        };

        fetchData();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user);
        });
        return () => subscription.unsubscribe();
    }, [locale]);

    const removeCard = (id: string) => {
        setConfessions((prev) => prev.filter((c) => c.id !== id));
    };

    const handleVote = async (confessionId: string, direction: 'left' | 'right') => {
        const now = Date.now();
        const timeSpent = now - lastCardTime;
        setLastCardTime(now);

        // Track the swipe event
        track('vote', { direction, confessionId });

        // Credit Earning Logic (Only for logged in users)
        if (user) {
            if (timeSpent > 1500) {
                const newProgress = voteProgress + 1;
                if (newProgress >= 5) {
                    setVoteProgress(0);
                    const newBalance = await addReward();
                    setShowToast({ message: "🎉 +1 Analiz Hakkı Kazandın!", type: 'success' });
                    // Optional: Vibrate
                    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                } else {
                    setVoteProgress(newProgress);
                }
            } else {
                setShowToast({ message: "⛔ Çok Hızlısın! (Okumadan geçme)", type: 'warning' });
            }
        }

        // Check if user is logged in
        if (!user) {
            setPendingVote({ id: confessionId, dir: direction });
            setShowLoginPrompt(true);
            return false; // Don't proceed with vote
        }

        // User is logged in, process the vote
        // OPTIMISTIC UPDATE: Remove card immediately for smooth UX
        removeCard(confessionId);

        // Fire and forget DB update
        const votePromise = async () => {
            if (direction === 'right') {
                await supabase.rpc('increment_like', { confession_id: confessionId });
            } else if (direction === 'left') {
                await supabase.rpc('increment_dislike', { confession_id: confessionId });
            }
        };
        votePromise();

        return true;
    };

    const goToLogin = () => {
        router.push('/login');
    };

    if (!loading && confessions.length === 0) {
        return (
            <div className="h-[100dvh] w-full flex flex-col items-center justify-center text-center p-8 bg-black">
                <div className="text-6xl mb-6">🔒</div>
                <h2 className="text-3xl font-bold mb-3 text-zinc-500">{t('all_caught_up')}</h2>
                <p className="text-lg text-zinc-600">{t('refresh_hint')}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-8 px-6 py-3 rounded-full transition-colors bg-zinc-800 text-zinc-400 hover:text-white"
                >
                    {tCommon('refresh')}
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="h-[100dvh] w-full flex items-center justify-center bg-black">
                <div className="animate-pulse text-lg text-zinc-500">{tCommon('loading')}</div>
            </div>
        );
    }

    // Only render the top 2 cards for performance
    const visibleCards = confessions.slice(0, 2);

    return (
        <div className="h-full w-full bg-black overflow-hidden relative flex flex-col items-center justify-center">

            {/* Progress HUD */}
            {user && (
                <div className="absolute top-4 left-0 w-full z-50 flex justify-center pointer-events-none">
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 flex items-center gap-3 shadow-lg">
                        <span className="text-xs font-bold text-zinc-300">
                            {locale === 'tr' ? 'Kredi Kazan:' : 'Earn Credits:'}
                        </span>
                        <div className="flex gap-1">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${i < voteProgress ? 'bg-amber-500 scale-110' : 'bg-zinc-700'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            <AnimatePresence>
                {showToast && (
                    <m.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`absolute top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-xl font-bold text-sm whitespace-nowrap ${showToast.type === 'success'
                                ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                : 'bg-red-500 text-white shadow-red-500/20'
                            }`}
                    >
                        {showToast.message}
                    </m.div>
                )}
            </AnimatePresence>

            {/* Login Prompt Modal */}
            <AnimatePresence>
                {showLoginPrompt && (
                    <m.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setShowLoginPrompt(false)}
                    >
                        <m.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full text-center"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LogIn className="text-indigo-400" size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">
                                {locale === 'tr' ? 'Oy Vermek İçin Giriş Yap' : 'Login to Vote'}
                            </h3>
                            <p className="text-zinc-400 text-sm mb-6">
                                {locale === 'tr'
                                    ? 'İtirafları oylamak için hesabınıza giriş yapmanız gerekiyor.'
                                    : 'You need to login to vote on confessions.'}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLoginPrompt(false)}
                                    className="flex-1 px-4 py-3 bg-zinc-800 text-zinc-300 rounded-xl font-medium hover:bg-zinc-700 transition-colors"
                                >
                                    {locale === 'tr' ? 'İptal' : 'Cancel'}
                                </button>
                                <button
                                    onClick={goToLogin}
                                    className="flex-1 px-4 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors"
                                >
                                    {locale === 'tr' ? 'Giriş Yap' : 'Login'}
                                </button>
                            </div>
                        </m.div>
                    </m.div>
                )}
            </AnimatePresence>

            {/* Header / Brand */}
            <div className="absolute top-14 left-0 right-0 z-40 flex justify-center pointer-events-none">
                <div className="bg-zinc-900/95 px-4 py-1.5 rounded-full border border-white/5 flex gap-4 text-[10px] font-bold tracking-widest uppercase text-zinc-500 shadow-xl">
                    <span className="flex items-center gap-1"><span className="text-red-500">←</span> {t('trouble')}</span>
                    <span className="w-px h-3 bg-zinc-700/50"></span>
                    <span className="flex items-center gap-1">{t('valid')} <span className="text-emerald-500">→</span></span>
                </div>
            </div>

            {/* FAB - Small Circle Icon */}
            <m.button
                onClick={() => setIsModalOpen(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="fixed bottom-24 right-4 z-40 w-12 h-12 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30"
            >
                <Plus size={24} strokeWidth={2.5} className="text-white" />
            </m.button>

            <div className="relative w-full max-w-md h-[70vh] flex items-center justify-center">
                <AnimatePresence>
                    {visibleCards.map((confession, index) => {
                        const isTop = index === 0;
                        return (
                            <SwipeableCard
                                key={confession.id}
                                confession={confession}
                                onSwipe={async (dir) => {
                                    // Skip (up) - just remove card, no vote
                                    if (dir === 'up') {
                                        removeCard(confession.id);
                                        return;
                                    }

                                    // Try to vote (will check auth)
                                    const success = await handleVote(confession.id, dir);
                                    // If not successful (not logged in), card stays
                                }}
                                isTop={isTop}
                                total={confessions.length}
                                isLoggedIn={!!user}
                                onLoginRequired={() => setShowLoginPrompt(true)}
                            />
                        );
                    }).reverse()}
                </AnimatePresence>
            </div>

            {/* Bottom Actions Hint */}
            <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none opacity-40">
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
                    {t('swipe_hint')}
                </p>
            </div>
        </div>
    );
}

// Wrapper to handle drag logic independent of the visual card
function SwipeableCard({ confession, onSwipe, isTop, total, isLoggedIn, onLoginRequired }: {
    confession: Confession;
    onSwipe: (dir: 'left' | 'right' | 'up') => void;
    isTop: boolean;
    total: number;
    isLoggedIn?: boolean;
    onLoginRequired?: () => void;
}) {
    const tVote = useTranslations('vote_types');
    const tConf = useTranslations('confession');
    const locale = useLocale() as 'tr' | 'en';
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const [isCommentsOpen, setCommentsOpen] = useState(false);
    const [leaveX, setLeaveX] = useState<number>(0);

    // Rotation based on X movement
    const rotate = useTransform(x, [-200, 200], [-15, 15]);

    // Opacity/Scale overlays
    const validOpacity = useTransform(x, [20, 100], [0, 1]);
    const troubleOpacity = useTransform(x, [-20, -100], [0, 1]);
    const commentOpacity = useTransform(y, [-20, -100], [0, 1]);

    // Parse content
    const parseContent = (content: string) => {
        // Normalize line endings
        const normalized = content.replace(/\r\n/g, '\n');

        // Try splitting by double newline (paragraph break)
        const parts = normalized.split(/\n\s*\n/);
        if (parts.length >= 2) {
            return { hook: parts[0].trim(), fullStory: parts.slice(1).join('\n\n').trim() };
        }

        // Fallback: Try splitting by first newline if it looks like a header (short enough)
        const singleParts = normalized.split('\n');
        if (singleParts.length >= 2 && singleParts[0].length < 150) {
            return { hook: singleParts[0].trim(), fullStory: singleParts.slice(1).join('\n').trim() };
        }

        // Final Fallback
        return { hook: content.substring(0, 80) + '...', fullStory: content };
    };
    const { hook, fullStory } = parseContent(confession.content);

    const handleDragEnd = (event: any, info: PanInfo) => {
        const threshold = 100;
        const upThreshold = -100; // Negative Y is up

        if (info.offset.x > threshold) {
            setLeaveX(1000);
            onSwipe('right');
        } else if (info.offset.x < -threshold) {
            setLeaveX(-1000);
            onSwipe('left');
        } else if (info.offset.y < upThreshold) {
            // Swipe Up - Skip card (neutral skip, no vote)
            onSwipe('up');
        }
    };

    // Get dynamic vote type from confession or use default
    const vt = getVoteType(confession.vote_type || DEFAULT_VOTE_TYPE);
    const voteConfig = {
        right: {
            label: `${vt.emoji.positive} ${vt.labelPositive[locale as 'tr' | 'en']}`,
            color: "text-emerald-500",
            border: "border-emerald-500"
        },
        left: {
            label: `${vt.emoji.negative} ${vt.labelNegative[locale as 'tr' | 'en']}`,
            color: "text-red-500",
            border: "border-red-500"
        }
    };

    return (
        <m.div
            className="absolute top-0 left-0 w-full h-full flex items-center justify-center perspective-1000"
            style={{
                x: isTop ? x : 0,
                willChange: "transform",
                rotate: isTop ? rotate : 0,
                zIndex: isTop ? 50 : 10,
                scale: isTop ? 1 : 0.95,
                y: isTop ? y : (0 + 20),
            }}
            drag={isTop ? true : false}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.6}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: isTop ? 1 : 0.95, opacity: 1, y: isTop ? 0 : 20 }}
            exit={{
                x: leaveX !== 0 ? leaveX : (x.get() < 0 ? -500 : 500),
                opacity: 0,
                transition: { duration: 0.2 }
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            {/* OVERLAYS */}
            {isTop && (
                <>
                    {/* RIGHT SWIPE OVERLAY */}
                    <m.div
                        style={{ opacity: validOpacity }}
                        className={`absolute top-10 left-10 z-50 pointer-events-none -rotate-12 border-4 ${voteConfig.right.border} rounded-xl px-4 py-2`}
                    >
                        <span className={`text-3xl font-black ${voteConfig.right.color} uppercase tracking-widest whitespace-nowrap`}>
                            {voteConfig.right.label}
                        </span>
                    </m.div>

                    {/* LEFT SWIPE OVERLAY */}
                    <m.div
                        style={{ opacity: troubleOpacity }}
                        className={`absolute top-10 right-10 z-50 pointer-events-none rotate-12 border-4 ${voteConfig.left.border} rounded-xl px-4 py-2`}
                    >
                        <span className={`text-3xl font-black ${voteConfig.left.color} uppercase tracking-widest whitespace-nowrap`}>
                            {voteConfig.left.label}
                        </span>
                    </m.div>

                    {/* SKIP (Up) */}
                    <m.div
                        style={{ opacity: commentOpacity }}
                        className="absolute bottom-20 left-0 right-0 flex justify-center z-50 pointer-events-none"
                    >
                        <div className="bg-zinc-600 text-white px-6 py-2 rounded-full font-bold shadow-xl flex items-center gap-2">
                            ⏭️ {locale === 'tr' ? 'Atla' : 'Skip'}
                        </div>
                    </m.div>
                </>
            )}

            <ConfessionCard
                id={confession.id}
                hook={hook}
                fullStory={fullStory}
                toxicScore={confession.toxic_score || 0}
                juryScore={0}
                category={confession.category || "İtiraf"}
                voteType={confession.vote_type || DEFAULT_VOTE_TYPE}
                likeCount={confession.like_count || 0}
                dislikeCount={confession.dislike_count || 0}
                forceDrawerOpen={isCommentsOpen}
                onDrawerClose={() => setCommentsOpen(false)}
            />
        </m.div>
    );
}
