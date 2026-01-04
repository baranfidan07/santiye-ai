import { Suspense } from "react";
import ChatInterface from "@/components/ChatInterface";

export default function AppPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-zinc-950 text-white">Yükleniyor...</div>}>
            <ChatInterface />
        </Suspense>
    );
}
