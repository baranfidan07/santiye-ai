"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

import GoogleLoginButton from "./GoogleLoginButton";

interface ResultLockProps {
    children: React.ReactNode;
    isLocked: boolean;
}

export default function ResultLock({ children, isLocked }: ResultLockProps) {
    // If not locked, just render children
    if (!isLocked) return <>{children}</>;

    const t = useTranslations('result_lock');

    return (
        <div className={cn("relative overflow-hidden rounded-2xl", isLocked && "min-h-[500px]")}>
            {/* Blurred Content */}
            <div className="filter blur-md select-none opacity-50 pointer-events-none" aria-hidden="true">
                {children}
            </div>

            {/* Lock Overlay */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-b from-transparent to-zinc-950/80 p-6 text-center"
            >
                <div className="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl shadow-2xl max-w-sm w-full backdrop-blur-sm">
                    <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock size={24} />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">
                        {t('title')}
                    </h3>

                    <p className="text-zinc-400 text-sm mb-6">
                        {t('description')}
                    </p>

                    <GoogleLoginButton className="mb-3" />

                    <Link
                        href="/login"
                        className="block w-full border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-medium py-3 rounded-xl transition-colors text-sm"
                    >
                        {t('email_button')}
                    </Link>

                    <p className="text-zinc-500 text-xs mt-4">
                        {t('secure_note')}
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
