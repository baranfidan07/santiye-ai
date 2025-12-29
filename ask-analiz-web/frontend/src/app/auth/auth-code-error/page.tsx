"use client";

import Link from "next/link";

export default function AuthCodeError() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="text-6xl mb-6">🔐</div>
                <h1 className="text-2xl font-bold text-white mb-4">
                    Authentication Error
                </h1>
                <p className="text-zinc-400 mb-8">
                    There was an error during the login process. Please try again.
                </p>
                <Link
                    href="/login"
                    className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition-colors"
                >
                    Try Again
                </Link>
            </div>
        </div>
    );
}
