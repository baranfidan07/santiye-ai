"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { Sparkles, MessageSquareQuote, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar() {
    const t = useTranslations('nav');
    const locale = useLocale();
    const pathname = usePathname();

    const items = [
        { label: t('chat'), href: "/", icon: Sparkles },
        { label: t('feed'), href: "/confessions", icon: MessageSquareQuote },
        { label: t('quizzes'), href: "/quizzes", icon: ClipboardCheck },
    ];

    return (
        <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-zinc-900 border-r border-zinc-800 p-6 z-50">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                    Ask<span className="text-indigo-500">Analiz</span>
                </h1>
            </div>

            <nav className="flex flex-col gap-2">
                {items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-indigo-600/10 text-indigo-400"
                                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
                            )}
                        >
                            <Icon size={20} className={cn(isActive && "text-indigo-500")} />
                            <span className="font-medium">{item.label}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto pt-6 border-t border-zinc-800">
                <div className="bg-zinc-800/50 p-4 rounded-xl mb-4">
                    <p className="text-xs text-zinc-400 leading-relaxed">
                        {locale === 'en'
                            ? "AI-powered relationship analysis. Private & Secure."
                            : "Gizlilik odaklı, yapay zeka destekli ilişki analizi. Verileriniz saklanmaz."}
                    </p>
                </div>

                <div className="flex gap-2">
                    <Link
                        href={pathname}
                        locale="tr"
                        className={cn(
                            "flex-1 py-2 text-xs font-bold text-center rounded-lg border transition-all",
                            locale === 'tr'
                                ? "bg-zinc-800 text-white border-zinc-700"
                                : "text-zinc-500 border-transparent hover:bg-zinc-800/50"
                        )}
                    >
                        🇹🇷 TR
                    </Link>
                    <Link
                        href={pathname}
                        locale="en"
                        className={cn(
                            "flex-1 py-2 text-xs font-bold text-center rounded-lg border transition-all",
                            locale === 'en'
                                ? "bg-zinc-800 text-white border-zinc-700"
                                : "text-zinc-500 border-transparent hover:bg-zinc-800/50"
                        )}
                    >
                        🇺🇸 EN
                    </Link>
                </div>
            </div>
        </aside>
    );
}
