'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { Dragon, useSize, type Follow, type Pt } from '@/components/sections/BossFight'
import { sfx } from '@/lib/sfx'

// Shenron's colours, on the same dragon that plays Kaido in the Experience section.
const SHENRON = { body: '#22c55e', edge: '#14532d', belly: '#fde68a', gold: '#15803d', mane: '#166534', whisker: '#bbf7d0', eye: '#ef4444' }

export type Wish = { label: string; grant: () => void }

// The hero's Dragon Balls have been gathered: the sky goes dark around them, Shenron rises out of them (`from`, in
// viewport coordinates) and follows the pointer, and the wishes he offers are the résumé's real calls to action.
// He fills the viewport from a portal on <body>: inside the page he would be clipped to the hero, which is taller
// than a phone screen, and re-anchored by Sage Mode's filter.
export default function Shenron({ from, wishes, onLeave }: { from: Pt; wishes: Wish[]; onLeave: () => void }) {
    const sky = useRef<HTMLDivElement>(null)
    const { w, h } = useSize(sky)
    const follow = useRef<Follow | null>(null)
    const [granted, setGranted] = useState<Wish | null>(null)
    const glow = Math.min(w, h) * 0.14 // how much sky stays clear around the glowing Dragon Balls

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onLeave() }
        window.addEventListener('keydown', onKey)
        // Scrolling away from the Dragon Balls sends him home
        window.addEventListener('scroll', onLeave, { passive: true })
        return () => {
            window.removeEventListener('keydown', onKey)
            window.removeEventListener('scroll', onLeave)
        }
    }, [onLeave])

    // Canon: his eyes glow, the wish is granted, and he is gone.
    useEffect(() => {
        if (!granted) return
        sfx.levelUp()
        const timer = setTimeout(() => { granted.grant(); onLeave() }, 1500)
        return () => clearTimeout(timer)
    }, [granted, onLeave])

    return createPortal(
        <motion.div
            ref={sky}
            role="dialog"
            aria-modal="true"
            aria-label="Shenron, the Eternal Dragon. Choose a wish."
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect()
                follow.current = { x: e.clientX - r.left, y: e.clientY - r.top, until: performance.now() + 4000 }
            }}
            style={{ background: `radial-gradient(circle at ${from.x}px ${from.y}px, transparent ${glow}px, rgba(1, 8, 4, 0.98) ${glow * 1.7}px)` }}
            className="fixed inset-0 z-[120] overflow-hidden text-white"
        >
            {/* The summoning: two strokes of lightning, then the storm keeps rolling while he is out, as in canon */}
            <motion.div className="absolute inset-0 bg-white pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.85, 0, 0.5, 0] }} transition={{ duration: 0.7, times: [0, 0.1, 0.3, 0.4, 1] }} aria-hidden />
            <motion.div className="absolute inset-0 bg-emerald-100 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.18, 0, 0.1, 0] }} transition={{ duration: 0.5, times: [0, 0.1, 0.3, 0.4, 1], delay: 3, repeat: Infinity, repeatDelay: 4.5 }} aria-hidden />
            <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
                {w > 0 && <Dragon w={w} h={h} size={Math.max(1.2, Math.min(w, h) / 300)} palette={granted ? { ...SHENRON, eye: '#fff' } : SHENRON} from={from} follow={follow} />}
            </svg>
            <div className="absolute inset-x-0 bottom-[8%] lg:bottom-[12%] flex flex-col items-center gap-4 px-5 text-center">
                <div className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.35em] text-emerald-300/80">神龍 · Shenron, the Eternal Dragon</div>
                <div className="text-3xl sm:text-5xl font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-[linear-gradient(180deg,#fff,#fde047_45%,#f97316)]">
                    {granted ? 'Your wish has been granted' : 'State your wish'}
                </div>
                {granted ? (
                    <div className="font-mono text-xs uppercase tracking-[0.3em] text-white/70">{granted.label}</div>
                ) : (
                    <>
                        <div className="flex flex-col sm:flex-row gap-3">
                            {wishes.map((wish, i) => (
                                <button
                                    key={wish.label}
                                    type="button"
                                    autoFocus={i === 0}
                                    onClick={() => setGranted(wish)}
                                    className="px-5 py-3 bg-black/70 border border-orange-400/60 text-orange-200 font-bold text-xs sm:text-sm tracking-widest uppercase hover:bg-orange-500 hover:text-black focus-visible:bg-orange-500 focus-visible:text-black outline-none transition-colors"
                                >
                                    {wish.label}
                                </button>
                            ))}
                        </div>
                        <button type="button" onClick={onLeave} className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50 hover:text-white/90 transition-colors">
                            No wish today · Esc
                        </button>
                    </>
                )}
            </div>
        </motion.div>,
        document.body,
    )
}
