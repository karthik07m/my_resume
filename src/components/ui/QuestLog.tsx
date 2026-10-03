'use client'

import { useEffect, useRef, useState } from 'react'
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
    const [unlocked, setUnlocked] = useState(0)
    const [toasts, setToasts] = useState<Toast[]>([])
    const seen = useRef(new Set<string>())

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    const id = entry.target.id
                    if (!entry.isIntersecting || seen.current.has(id)) continue
                    seen.current.add(id)
                    const count = seen.current.size
                    setUnlocked(count)
                    const quest = QUESTS.find((q) => q.id === id)
                    const toast: Toast[] = quest && id !== 'hero'
                        ? [{ id: count * 2, kicker: `[SYSTEM] Quest unlocked · LV ${count}`, text: quest.name }]
                        : []
                    if (count === QUESTS.length) {
                        toast.push({ id: count * 2 + 1, kicker: '[SYSTEM] Achievement', text: 'Phantom Sixth Man: you saw everything 🏆' })
                    }
                    if (toast.length) { setToasts((t) => [...t, ...toast].slice(-2)); sfx.levelUp() }
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
        const timer = setTimeout(() => setToasts((t) => t.slice(1)), 2000)
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
                PLAYER LV {unlocked}/{QUESTS.length}
            </div>

            {/* Toasts */}
            {/* xl+ only: below that the toast sits on top of the job cards. The LV badge still counts up everywhere. */}
            <div className="hidden xl:flex fixed bottom-16 right-4 z-[60] flex-col gap-2 items-end pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            role="status"
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                            className="relative max-w-[18rem] px-4 py-2 rounded-md bg-blue-950/90 border border-blue-400/50 shadow-lg shadow-blue-500/20 backdrop-blur text-left"
                        >
                            {['top-1 left-1 border-t-2 border-l-2', 'top-1 right-1 border-t-2 border-r-2', 'bottom-1 left-1 border-b-2 border-l-2', 'bottom-1 right-1 border-b-2 border-r-2'].map((c) => (
                                    <span key={c} aria-hidden className={`absolute w-3 h-3 border-blue-400/80 ${c}`} />
                                ))}
                            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-300">{toast.kicker}</div>
                            <div className="text-xs sm:text-sm font-bold text-white">{toast.text}</div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </>
    )
}
