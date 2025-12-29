"use client";

import { History, Globe } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";

import { useCredits } from "@/contexts/CreditsContext";

interface MobileHeaderProps {
    onHistoryClick: () => void;
}

// Internal component to safely access context
function CreditCount() {
    const { credits, loading } = useCredits();
    if (loading) return <span className="w-3 h-3 block bg-zinc-700 rounded-full animate-pulse" />;
    return <>{credits}</>;
}

export default function MobileHeader({ onHistoryClick }: MobileHeaderProps) {
    const pathname = usePathname();
    const locale = useLocale();
    const isHome = pathname === "/";

    return (
        <div className="fixed top-0 left-0 right-0 h-24 z-40 flex items-start justify-between px-4 pt-4 pointer-events-none bg-gradient-to-b from-[#18181b] via-[#18181b]/90 to-transparent">
            {/* Left Section */}
            <div className="flex-1 flex justify-start pointer-events-auto">
                {isHome && (
                    <button
                        onClick={onHistoryClick}
                        className="p-2 backdrop-blur rounded-full shadow-lg transition-transform active:scale-95 border bg-zinc-900/80 text-zinc-400 hover:text-white border-zinc-800"
                    >
                        <History size={20} />
                    </button>
                )}
            </div>

            {/* Center Logo */}
            <div className="flex-none pointer-events-auto">
                <h1 className="text-base font-bold drop-shadow-md tracking-tight flex items-center gap-1 text-white">
                    Ask<span className="text-indigo-500">Analiz</span>
                </h1>
            </div>

            {/* Right Section (Credits Badge) */}
            <div className="flex-1 flex justify-end pointer-events-auto items-center gap-2">
                <Link
                    href={pathname}
                    locale={locale === 'tr' ? 'en' : 'tr'}
                    className="p-2 backdrop-blur rounded-full shadow-lg transition-transform active:scale-95 flex items-center gap-1 text-xs font-bold border bg-zinc-900/80 text-zinc-400 hover:text-white border-zinc-800"
                >
                    <span className="text-[10px]">{locale.toUpperCase()}</span>
                </Link>

                <Link
                    href="/profile"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/90 border border-zinc-800 rounded-full shadow-lg backdrop-blur-md active:scale-95 transition-all"
                >
                    <span className="text-indigo-400 animate-pulse">💎</span>
                    <span className="text-white font-bold text-xs"><CreditCount /></span>
                </Link>
            </div>
        </div>
    );
}

