"use client";

import { Suspense, useState } from "react";
import dynamic from 'next/dynamic';

const ChatSidebar = dynamic(() => import('../ChatSidebar'), {
    loading: () => null,
    ssr: false // Sidebar is client-only interaction anyway
});

import BottomNav from "./BottomNav";
import MobileHeader from "./MobileHeader";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    return (
        <div className="flex h-[100dvh] flex-col overflow-hidden bg-transparent">
            {/* Mesh Gradient Background */}
            <div className="mesh-gradient-bg" />

            {/* Global Header */}
            <MobileHeader onHistoryClick={() => setIsHistoryOpen(true)} />

            {/* History Drawer */}
            <Suspense fallback={null}>
                {isHistoryOpen && <ChatSidebar isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />}
            </Suspense>

            {/* Main Content Area */}
            <main className="flex-1 w-full relative overflow-y-auto overflow-x-hidden flex flex-col scroll-smooth">
                {children}
            </main>

            {/* Global Bottom Navigation */}
            <BottomNav />
        </div>
    );
}

