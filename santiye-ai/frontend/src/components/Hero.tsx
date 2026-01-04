"use client";

import { motion } from "framer-motion";

export default function Hero() {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4">
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4"
            >
                Şüphelerinizi <span className="text-indigo-400">Veriye</span> Dönüştürün
            </motion.h1>
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-zinc-400 max-w-2xl"
            >
                Yapay zeka destekli ilişki analizi ile belirsizlikleri ortadan kaldırın.
            </motion.p>
        </div>
    );
}
