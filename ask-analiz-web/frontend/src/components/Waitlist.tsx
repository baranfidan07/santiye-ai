"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

export default function Waitlist() {
    const [email, setEmail] = useState("");
    const [joined, setJoined] = useState(false);

    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setJoined(true);
            // Logic to actually save email would go here
        }
    };

    if (joined) {
        return (
            <div className="text-center p-6 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <div className="flex items-center justify-center gap-2 text-emerald-400 mb-2">
                    <Check className="w-5 h-5" />
                    <span className="font-semibold">Sıraya Alındınız</span>
                </div>
                <p className="text-sm text-zinc-400">Detaylı raporunuz hazır olduğunda haber vereceğiz.</p>
            </div>
        )
    }

    return (
        <div className="w-full max-w-md mx-auto text-center mt-12 mb-12">
            <p className="text-zinc-400 mb-4 text-sm">Detaylı rapor ve uzman görüşü için bekleme listesine katılın.</p>
            <form onSubmit={handleJoin} className="flex gap-2">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-posta adresiniz"
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 text-sm"
                    required
                />
                <button
                    type="submit"
                    className="bg-white text-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-zinc-200 transition-colors flex items-center gap-1"
                >
                    Katıl <ArrowRight className="w-3 h-3" />
                </button>
            </form>
        </div>
    );
}
