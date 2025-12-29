"use client";

import { PersonaType } from "@/lib/personas";

export default function AuroraBackground({ isInteracting = false, persona }: { isInteracting?: boolean; persona?: PersonaType }) {
    const isRizzMode = persona === 'taktik';

    return (
        <div className={`fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-colors duration-1000 ${isRizzMode ? 'bg-black' : 'bg-[#09090b]'}`}>
            <div className={`absolute inset-0 transition-opacity duration-1000 ${isInteracting ? 'opacity-100' : 'opacity-80'}`}>
                {/* CSS Based Orbs with AGGRESSIVE movement */}
                <div className={`absolute top-0 left-0 w-[70vw] h-[70vw] rounded-full blur-[80px] animate-blob mix-blend-screen opacity-70 transition-colors duration-1000 ${isRizzMode ? 'bg-emerald-900/40' : 'bg-purple-600/40'}`}></div>
                <div className={`absolute top-0 right-0 w-[70vw] h-[70vw] rounded-full blur-[80px] animate-blob animation-delay-2000 mix-blend-screen opacity-70 transition-colors duration-1000 ${isRizzMode ? 'bg-purple-900/35' : 'bg-pink-600/35'}`}></div>
                <div className={`absolute -bottom-32 left-20 w-[70vw] h-[70vw] rounded-full blur-[80px] animate-blob animation-delay-4000 mix-blend-screen opacity-70 transition-colors duration-1000 ${isRizzMode ? 'bg-green-900/40' : 'bg-indigo-600/40'}`}></div>
            </div>

            {/* Noise Texture */}
            <div className="absolute inset-0 bg-transparent opacity-20" style={{ backgroundImage: 'url("/noise.png")' }}></div>

            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(300px, -200px) scale(1.2); }
                    66% { transform: translate(-300px, 200px) scale(0.8); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 10s infinite ease-in-out;
                    will-change: transform;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
}
