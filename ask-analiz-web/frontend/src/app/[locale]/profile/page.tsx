"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { LogOut, Mail, Calendar, Settings, ChevronRight, MessageSquare, Heart, Target, Loader2, Globe, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { useCredits } from "@/contexts/CreditsContext";
import UserConfessionsList from "@/components/profile/UserConfessionsList";
import NotificationsList from "@/components/profile/NotificationsList";

interface ProfileStats {
    analysisCount: number;
    confessionCount: number;
    auraPoints: number;
}

export default function ProfilePage() {
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale();
    const t = useTranslations('profile');
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<ProfileStats>({ analysisCount: 0, confessionCount: 0, auraPoints: 0 });
    const [statsLoading, setStatsLoading] = useState(true);
    const { credits } = useCredits();

    // Settings state
    const [notifications, setNotifications] = useState(true);

    // Use ref to avoid stale closure in auth listener
    const userIdRef = useRef<string | null>(null);

    // Load settings from localStorage
    useEffect(() => {
        const savedNotifications = localStorage.getItem('notifications');
        if (savedNotifications !== null) setNotifications(savedNotifications === 'true');
    }, []);

    const fetchUserStats = async (userId: string) => {
        setStatsLoading(true);
        try {
            const { count: analysisCount } = await supabase
                .from('chat_sessions')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            const { count: confessionCount } = await supabase
                .from('confessions')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            // Use maybeSingle() or just select and check length to be safe
            const { data: profileData } = await supabase
                .from('profiles')
                .select('aura_points')
                .eq('id', userId)
                .maybeSingle();

            setStats({
                analysisCount: analysisCount || 0,
                confessionCount: confessionCount || 0,
                auraPoints: profileData?.aura_points || 0
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setStatsLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;
        let timeoutId: NodeJS.Timeout;

        const init = async () => {
            console.log("Profile: init started");
            try {
                // Failsafe: Force loading false after 4 seconds to prevent eternal spinner
                timeoutId = setTimeout(() => {
                    if (mounted) setLoading(false);
                    console.warn("Profile: Init timed out, forcing loading false");
                }, 4000);

                // Check active session first
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) throw sessionError;

                if (session?.user) {
                    if (mounted) {
                        setUser(session.user);
                        // Don't await stats, let them load in parallel
                        fetchUserStats(session.user.id);
                    }
                } else {
                    // Double check with getUser for security (sometimes session is stale but valid on server)
                    const { data: { user }, error: userError } = await supabase.auth.getUser();
                    if (user && mounted) {
                        setUser(user);
                        fetchUserStats(user.id);
                    }
                }
            } catch (error) {
                console.error("Profile: Init error", error);
            } finally {
                if (mounted) {
                    setLoading(false);
                    clearTimeout(timeoutId);
                }
                console.log("Profile: init complete");
            }
        };

        init();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;
            console.log("Profile: Auth change", event);

            if (event === 'SIGNED_IN' && session?.user) {
                setUser(session.user);
                setLoading(false);
                fetchUserStats(session.user.id);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setStats({ analysisCount: 0, confessionCount: 0, auraPoints: 0 });
            }
        });

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
            authListener.subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        // Force hard refresh to clear all states/cache
        window.location.href = "/login";
    };

    const handleLanguageChange = (newLocale: 'tr' | 'en') => {
        router.replace(pathname, { locale: newLocale });
    };



    const handleNotificationsToggle = () => {
        const newValue = !notifications;
        setNotifications(newValue);
        localStorage.setItem('notifications', String(newValue));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
        );
    }

    // Show login prompt if not authenticated (instead of redirect to prevent loops)
    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white gap-4 p-6">
                <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center text-4xl">
                    👤
                </div>
                <h1 className="text-xl font-bold">{locale === 'tr' ? 'Giriş Yapmalısın' : 'Login Required'}</h1>
                <p className="text-zinc-500 text-center max-w-xs">
                    {locale === 'tr'
                        ? 'Profil sayfasını görmek için giriş yapman gerekiyor.'
                        : 'You need to login to view your profile.'}
                </p>
                <button
                    onClick={() => router.push('/login')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition-all"
                >
                    {locale === 'tr' ? 'Giriş Yap' : 'Login'}
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24 bg-black text-white">
            {/* Header */}
            <div className="pt-20 px-6 pb-8">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold shadow-lg">
                        {user?.email?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">
                            {user?.user_metadata?.full_name || user?.email?.split("@")[0] || t('default_name')}
                        </h1>
                        <p className="text-zinc-500 text-sm flex items-center gap-1">
                            <Mail size={14} />
                            {user?.email}
                        </p>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className="px-4 md:px-6 mb-6">
                <NotificationsList userId={user.id} />
            </div>

            {/* Stats */}
            <div className="px-4 md:px-6 mb-4 md:mb-8">
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="rounded-xl p-3 md:p-4 text-center border transition-colors bg-zinc-900 border-zinc-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-1.5 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-4xl">💎</span>
                        </div>
                        {loading ? (
                            <Loader2 className="animate-spin mx-auto text-indigo-400" size={16} />
                        ) : (
                            <div className="text-2xl md:text-3xl font-bold text-indigo-400">{credits}</div>
                        )}
                        <div className="text-xs flex items-center justify-center gap-1 mt-1 text-zinc-500 font-medium uppercase tracking-wide">
                            {locale === 'tr' ? 'Kredi' : 'Credits'}
                        </div>
                    </div>

                    <div className="rounded-xl p-3 md:p-4 text-center border transition-colors bg-zinc-900 border-zinc-800">
                        {statsLoading ? (
                            <Loader2 className="animate-spin mx-auto text-yellow-400" size={16} />
                        ) : (
                            <div className="text-2xl md:text-3xl font-bold text-yellow-500">✨{stats.auraPoints}</div>
                        )}
                        <div className="text-xs flex items-center justify-center gap-1 mt-1 text-zinc-500 font-medium uppercase tracking-wide">
                            {t('stats.aura')}
                        </div>
                    </div>

                    <div className="rounded-xl p-3 md:p-4 text-center border transition-colors bg-zinc-900 border-zinc-800">
                        {statsLoading ? (
                            <Loader2 className="animate-spin mx-auto text-blue-400" size={16} />
                        ) : (
                            <div className="text-2xl md:text-3xl font-bold text-blue-500">{stats.analysisCount}</div>
                        )}
                        <div className="text-xs flex items-center justify-center gap-1 mt-1 text-zinc-500 font-medium uppercase tracking-wide">
                            {t('stats.analyses')}
                        </div>
                    </div>

                    <div className="rounded-xl p-3 md:p-4 text-center border transition-colors bg-zinc-900 border-zinc-800">
                        {statsLoading ? (
                            <Loader2 className="animate-spin mx-auto text-red-400" size={16} />
                        ) : (
                            <div className="text-2xl md:text-3xl font-bold text-red-500">{stats.confessionCount}</div>
                        )}
                        <div className="text-xs flex items-center justify-center gap-1 mt-1 text-zinc-500 font-medium uppercase tracking-wide">
                            {t('stats.confessions')}
                        </div>
                    </div>
                </div>
            </div>

            {/* User's Confessions Scoreboard */}
            <div className="px-4 md:px-6 mb-8">
                <UserConfessionsList userId={user.id} />
            </div>

            {/* Settings Section */}
            <div className="px-4 md:px-6 mb-3 md:mb-6">
                <h2 className="text-zinc-400 text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Settings size={12} />
                    {locale === 'tr' ? 'Ayarlar' : 'Settings'}
                </h2>
                <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                    {/* Language Toggle */}
                    <div className="flex items-center justify-between p-2.5 md:p-4 border-b border-zinc-800">
                        <div className="flex items-center gap-2">
                            <Globe size={16} className="text-indigo-400" />
                            <span className="text-sm">{locale === 'tr' ? 'Dil' : 'Language'}</span>
                        </div>
                        <div className="flex bg-zinc-800 rounded-md p-0.5">
                            <button
                                onClick={() => handleLanguageChange('tr')}
                                className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${locale === 'tr'
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-zinc-400 hover:text-white'
                                    }`}
                            >
                                TR
                            </button>
                            <button
                                onClick={() => handleLanguageChange('en')}
                                className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${locale === 'en'
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-zinc-400 hover:text-white'
                                    }`}
                            >
                                EN
                            </button>
                        </div>
                    </div>

                    {/* Notifications Toggle */}
                    <div className="flex items-center justify-between p-2.5 md:p-4">
                        <div className="flex items-center gap-2">
                            <Bell size={16} className="text-yellow-400" />
                            <span className="text-sm">{locale === 'tr' ? 'Bildirimler' : 'Notifications'}</span>
                        </div>
                        <button
                            onClick={handleNotificationsToggle}
                            className={`w-10 h-5 rounded-full transition-colors relative ${notifications ? 'bg-indigo-600' : 'bg-zinc-700'
                                }`}
                        >
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${notifications ? 'translate-x-5' : 'translate-x-0.5'
                                }`} />
                        </button>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="px-4 md:px-6 space-y-2 md:space-y-3">
                    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                        <button
                            onClick={() => router.push("/")}
                            className="w-full flex items-center justify-between p-4 hover:bg-zinc-800 active:bg-zinc-700 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Calendar size={20} className="text-zinc-400" />
                                <span>{t('menu.history')}</span>
                            </div>
                            <ChevronRight size={20} className="text-zinc-600" />
                        </button>
                    </div>

                    {/* Logout */}
                    <motion.button
                        onClick={handleLogout}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">{t('logout')}</span>
                    </motion.button>
                </div>

                {/* Account Info */}
                <div className="px-6 mt-8">
                    <p className="text-zinc-600 text-xs text-center">
                        {t('created_at')}: {new Date(user?.created_at || "").toLocaleDateString("tr-TR")}
                    </p>
                </div>
            </div>
        </div>
    );
}
