"use client";

import { usePathname, useRouter } from "@/i18n/routing";
import { Sparkles, Flame, FlaskConical, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function BottomNav() {
    const t = useTranslations('nav');
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user);
        });
        return () => subscription.unsubscribe();
    }, []);

    // Hide BottomNav on Landing Page (root) or pure locale paths (/tr, /en)
    if (pathname === "/" || pathname === "/tr" || pathname === "/en") {
        return null;
    }

    const navItems = [
        { label: t('chat'), href: "/app", icon: Sparkles }, // Points to /app for Chat Interface
        { label: t('feed'), href: "/confessions", icon: Flame },
        { label: t('quizzes'), href: "/quizzes", icon: FlaskConical },
        {
            label: t('profile'),
            href: user ? "/profile" : "/login",
            icon: User
        },
    ];

    return (
        <div className="w-full min-h-[4rem] h-auto border-t flex-none flex items-center justify-around z-50 pb-[env(safe-area-inset-bottom)] pt-1 bg-zinc-900 border-zinc-800">
            {navItems.map((item) => {
                // Active state logic:
                // Chat active if pathname is exactly /app
                // Profile active if /profile or /login
                const isActive =
                    (item.href === "/app" && pathname === "/app") ||
                    (item.href !== "/app" && pathname === item.href) ||
                    (item.label === t('profile') && (pathname === "/login" || pathname === "/profile"));

                const Icon = item.icon;

                return (
                    <button
                        key={item.label}
                        onClick={() => router.push(item.href)}
                        className={cn(
                            "flex flex-col items-center gap-1 p-2 w-full transition-colors",
                            isActive
                                ? "text-indigo-500"
                                : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={cn("transition-transform", isActive ? "scale-110" : "")} />
                        <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                    </button>
                );
            })}
        </div>
    );
}

