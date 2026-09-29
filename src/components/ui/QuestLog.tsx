'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useScroll } from 'framer-motion'
import { sfx } from '@/lib/sfx'

// Section id -> quest name. Order matters: it is the order they unlock while scrolling.
const QUESTS: { id: string; name: string }[] = [
    { id: 'hero', name: 'Mission Start' },
    { id: 'about', name: 'The Code I Live By' },
    { id: 'experience', name: 'Experience Log' },
    { id: 'projects', name: 'System Logs' },
    { id: 'contact', name: 'Breath of Code' },
]

type Toast = { id: number; kicker: string; text: string }

// XP bar across the top that fills with scroll, plus "quest unlocked" toasts when each section is reached.
export default function QuestLog() {
    const { scrollYProgress } = useScroll()
    const [unlocked, setUnlocked] = useState<string[]>([])
    const [toasts, setToasts] = useState<Toast[]>([])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue
                    const id = entry.target.id
                    setUnlocked((prev) => {
                        if (prev.includes(id)) return prev
                        const next = [...prev, id]
                        const quest = QUESTS.find((q) => q.id === id)
                        const toast: Toast[] = quest && id !== 'hero'
                            ? [{ id: Date.now(), kicker: `[SYSTEM] Quest unlocked · LV ${next.length}`, text: quest.name }]
                            : []
                        if (next.length === QUESTS.length) {
                            toast.push({ id: Date.now() + 1, kicker: '[SYSTEM] Achievement', text: 'Phantom Sixth Man: you saw everything 🏆' })
                        }
                        if (toast.length) { setToasts((t) => [...t, ...toast]); sfx.levelUp() }
                        return next
                    })
                }
            },
            // Fire when any part of a section overlaps the middle band of the viewport,
            // so sections taller than the screen (Experience) still unlock.
            { rootMargin: '-40% 0px -40% 0px', threshold: 0 },
        )
        for (const q of QUESTS) {
            const el = document.getElementById(q.id)
            if (el) observer.observe(el)
        }
        return () => observer.disconnect()
    }, [])

    // Auto-dismiss toasts
    useEffect(() => {
        if (!toasts.length) return
        const timer = setTimeout(() => setToasts((t) => t.slice(1)), 2600)
        return () => clearTimeout(timer)
    }, [toasts])

    return (
        <>
            {/* XP bar */}
            <div className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-white/5" aria-hidden>
                <motion.div
                    style={{ scaleX: scrollYProgress, transformOrigin: '0% 50%' }}
                    className="h-full w-full bg-gradient-to-r from-green-500 via-emerald-400 to-teal-400 shadow-[0_0_12px_rgba(34,197,94,0.8)]"
                />
            </div>

            {/* Level badge */}
            <div className="fixed bottom-4 right-4 z-[60] px-3 py-1.5 rounded-full bg-black/70 backdrop-blur border border-green-500/30 font-mono text-[11px] text-green-400 tracking-widest pointer-events-none">
                PLAYER LV {unlocked.length}/{QUESTS.length}
            </div>

            {/* Toasts */}
            <div className="fixed bottom-16 left-1/2 -translate-x-1/2 sm:left-auto sm:right-4 sm:translate-x-0 z-[60] flex flex-col gap-2 items-center sm:items-end pointer-events-none w-[calc(100vw-2rem)] sm:w-auto">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            role="status"
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                            className="px-4 py-3 rounded-xl bg-zinc-900/95 border border-green-500/40 shadow-lg shadow-green-500/10 backdrop-blur text-left"
                        >
                            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-green-400">{toast.kicker}</div>
                            <div className="text-sm font-bold text-white">{toast.text}</div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </>
    )
}
