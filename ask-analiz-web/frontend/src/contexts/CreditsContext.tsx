"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface CreditsContextType {
    credits: number;
    loading: boolean;
    refreshCredits: () => Promise<void>;
    deductCredit: () => Promise<boolean>;
    addReward: (amount?: number) => Promise<number | null>; // Returns new balance
    showAdModal: boolean;
    setShowAdModal: (show: boolean) => void;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export function CreditsProvider({ children }: { children: React.ReactNode }) {
    const [credits, setCredits] = useState(5);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [showAdModal, setShowAdModal] = useState(false);

    // Initial fetch
    useEffect(() => {
        const init = async () => {
            const { data } = await supabase.auth.getUser();
            setUser(data.user);
            if (data.user) {
                await fetchCredits(data.user.id);
            } else {
                setLoading(false);
            }
        };
        init();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
            const newUser = session?.user;
            setUser(newUser);
            if (newUser) {
                await fetchCredits(newUser.id);
            } else {
                setCredits(5); // Default for guests (though guests don't really consume DB credits, we track local)
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchCredits = async (userId: string) => {
        try {
            const { data, error } = await supabase.from('profiles').select('credits').eq('id', userId).single();
            if (data) {
                setCredits(data.credits);
            }
            // If profile doesn't exist yet (race condition), default is 5
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const deductCredit = async () => {
        if (!user) {
            // Guest Logic: Maybe limit locally? Or guests are free for Mini? 
            // "Mini Analysis" is free. "Full" requires login.
            // If user is guest, they can't start "Full Session".
            // So this func is likely called only for Logged In users who want Full Analysis.
            return false;
        }

        // Optimistic update
        const oldCredits = credits;
        if (oldCredits <= 0) {
            setShowAdModal(true);
            return false;
        }

        setCredits(prev => Math.max(0, prev - 1));

        const { data, error } = await supabase.rpc('deduct_creditsforanalysis', { user_id: user.id });

        if (error || data === false) {
            // Rollback if failed
            console.error("Credit deduction failed:", error);
            setCredits(oldCredits); // Revert
            if (data === false) setShowAdModal(true); // Double check logic
            return false;
        }
        return true;
    };

    const addReward = async (amount: number = 1) => {
        if (!user) return null;

        // Optimistic
        setCredits(prev => prev + amount);

        const { data, error } = await supabase.rpc('add_reward_credit', { user_id: user.id, amount });
        if (error) {
            console.error("Reward failed:", error);
            fetchCredits(user.id); // Re-sync
            return null;
        }
        return data;
    };

    return (
        <CreditsContext.Provider value={{
            credits,
            loading,
            refreshCredits: async () => { if (user) await fetchCredits(user.id) },
            deductCredit,
            addReward,
            showAdModal,
            setShowAdModal
        }}>
            {children}
        </CreditsContext.Provider>
    );
}

export const useCredits = () => {
    const context = useContext(CreditsContext);
    if (!context) throw new Error("useCredits must be used within CreditsProvider");
    return context;
};
