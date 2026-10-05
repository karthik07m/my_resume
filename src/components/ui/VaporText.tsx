'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

// Cycles through words in the hero's ki colour (--ki): each one fades in, holds, then vaporizes (blur + spread + drift up).
export default function VaporText({ texts, className = '' }: { texts: string[]; className?: string }) {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => setIndex((i) => (i + 1) % texts.length), 4200)
        return () => clearInterval(timer)
    }, [texts.length])

    return (
        <div className={`relative h-10 ${className}`}>
            <AnimatePresence mode="wait">
                <motion.h2
                    key={texts[index]}
                    initial={{ opacity: 0, filter: 'blur(8px)', letterSpacing: '0.2em', y: 8 }}
                    animate={{ opacity: 1, filter: 'blur(0px)', letterSpacing: '0em', y: 0 }}
                    exit={{ opacity: 0, filter: 'blur(14px)', letterSpacing: '0.6em', y: -16 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="absolute inset-0 text-2xl font-bold text-(--ki) transition-colors duration-700 whitespace-nowrap"
                >
                    {texts[index]}
                </motion.h2>
            </AnimatePresence>
        </div>
    )
}
