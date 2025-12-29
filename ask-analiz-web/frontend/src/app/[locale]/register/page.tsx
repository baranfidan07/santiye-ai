"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
    const t = useTranslations('auth');
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
                emailRedirectTo: `${location.origin}/auth/callback`,
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            alert(t('register_success'));
            router.push("/login");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#18181b] px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md shadow-2xl"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">{t('register_title')}</h1>
                    <p className="text-zinc-400">{t('register_subtitle')}</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                        <input
                            type="text"
                            placeholder={t('full_name_placeholder')}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                        <input
                            type="email"
                            placeholder={t('email_placeholder')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                        <input
                            type="password"
                            placeholder={t('password_placeholder')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="animate-spin" size={20} />}
                        {t('register_btn')}
                    </button>
                </form>

                <div className="mt-6 text-center text-zinc-500 text-sm">
                    <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
                        {t('have_account')}
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
