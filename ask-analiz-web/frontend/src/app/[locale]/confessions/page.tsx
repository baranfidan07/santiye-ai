import ConfessionFeed from "@/components/ConfessionFeed";
import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';

// Create a single supabase client for server-side fetching
// Create a single supabase client for server-side fetching
// Fallback to placeholder if env vars are missing during build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

const supabase = createClient(supabaseUrl, supabaseKey);

const getConfessions = unstable_cache(
    async (locale: string) => {
        const { data } = await supabase
            .from("confessions")
            .select("*")
            .eq("locale", locale)
            .order("created_at", { ascending: false })
            .limit(50);
        return data || [];
    },
    ['confessions-feed'], // Cache key
    { revalidate: 60 } // Revalidate every 60 seconds
);

export default async function ConfessionsPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params;
    const confessions = await getConfessions(locale);

    return (
        <div className="h-full w-full bg-black relative overflow-hidden">
            {/* Background Texture - Cyberpunk Dot Grid */}
            <div className="absolute inset-0 opacity-20 pointer-events-none z-0"
                style={{
                    backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            />

            {/* The Feed with Cached Initial Data */}
            <ConfessionFeed initialConfessions={confessions as any} />
        </div>
    );
}
