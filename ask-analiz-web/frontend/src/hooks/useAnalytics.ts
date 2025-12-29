import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useAnalytics(userId: string | undefined) {
    const [auraPoints, setAuraPoints] = useState(0);

    // 1. Update Retention (Last Seen)
    useEffect(() => {
        if (!userId) return;

        const updateLastSeen = async () => {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    last_seen_at: new Date().toISOString()
                }, { onConflict: 'id' });

            if (error) console.error('Error updating last_seen:', error);
        };

        updateLastSeen();

        // Fetch initial Aura Points
        const fetchAura = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('aura_points')
                .eq('id', userId)
                .single();
            if (data) setAuraPoints(data.aura_points || 0);
        };
        fetchAura();

    }, [userId]);

    // 2. Log Feedback (Gamification & Labeling)
    const logFeedback = async (messageId: string, reaction: 'thumbs_up' | 'thumbs_down') => {
        if (!userId) return;

        // Note: Credits are updated optimistically in UI via the CreditsContext if we linked them,
        // but here we primarily handle the backend sync. 
        // Ideally, we should expose a 'refreshCredits' from useCredits to call here,
        // but for now we trust the RPC and next fetch will sync it.

        // Optimistic Aura Update (Legacy, keep for fun or remove?) -> Keeping for now as XP
        setAuraPoints(prev => prev + 10);

        try {
            // Call the specialized RPC that handles logging + rewarding
            const { error } = await supabase.rpc('log_feedback_and_reward', {
                p_message_id: messageId,
                p_feedback: { reaction: reaction, timestamp: new Date().toISOString() }
            });

            if (error) {
                // If RPC missing (user didn't migrate yet), fallback to old update
                console.warn("RPC log_feedback_and_reward not found, falling back to simple update", error);
                await supabase
                    .from('messages')
                    .update({ feedback: { reaction } })
                    .eq('id', messageId);
            }

        } catch (e) {
            console.error("Failed to log feedback", e);
            setAuraPoints(prev => prev - 10);
        }
    };

    return { auraPoints, logFeedback };
}
