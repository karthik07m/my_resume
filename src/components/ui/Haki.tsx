'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sfx } from '@/lib/sfx'

const subs = new Set<() => void>()

// Conqueror's Haki: a one-shot shockwave. Fired by the button on the current job card in Experience or by typing "haki".
export const haki = {
    unleash() {
        subs.forEach((s) => s())
        sfx.haki()
    },
}

// Deterministic lightning bolts radiating from the centre (same on server and client).
let seed = 11
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)
const BOLTS = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i / 12) * Math.PI * 2 + rand() * 0.4
    let x = 50, y = 50
    const pts = [`${x},${y}`]
    for (let s = 0; s < 7; s++) {
        const r = 7 + rand() * 4
        const a = angle + (rand() - 0.5) * 0.9
        x += Math.cos(a) * r
        y += Math.sin(a) * r
        pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
    }
    return { points: pts.join(' '), delay: rand() * 0.3 }
})

export default function Haki() {
    const [shot, setShot] = useState(0)

    useEffect(() => {
        let keys = ''
        const onKey = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
            keys = (keys + e.key.toLowerCase()).slice(-4)
            if (keys === 'haki') { keys = ''; haki.unleash() }
        }
        const onFire = () => setShot((n) => n + 1)
        window.addEventListener('keydown', onKey)
        subs.add(onFire)
        return () => {
            window.removeEventListener('keydown', onKey)
            subs.delete(onFire)
        }
    }, [])

    // Shake the page while the overlay is up.
    useEffect(() => {
        if (!shot) return
        document.documentElement.setAttribute('data-haki', '')
        const t = setTimeout(() => {
            document.documentElement.removeAttribute('data-haki')
            setShot(0)
        }, 1900)
        return () => clearTimeout(t)
    }, [shot])

    return (
        <AnimatePresence>
            {shot > 0 && (
                <motion.div
                    key={shot}
                    role="status"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[150] pointer-events-none flex items-center justify-center px-6 bg-[radial-gradient(circle,rgba(0,0,0,0.8)_0%,rgba(20,0,0,0.95)_70%)]"
                >
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden>
                        {BOLTS.map((b, i) => (
                            <motion.polyline
                                key={i}
                                points={b.points}
                                fill="none"
                                stroke={i % 2 ? '#dc2626' : '#0a0a0a'}
                                strokeWidth={i % 2 ? 2 : 3}
                                vectorEffect="non-scaling-stroke"
                                style={{ filter: 'drop-shadow(0 0 6px #ef4444)' }}
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: [0, 1, 0.4, 1, 1, 0] }}
                                transition={{ duration: 1.6, delay: b.delay }}
                            />
                        ))}
                    </svg>
                    <motion.div
                        initial={{ scale: 1.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 14 }}
                        className="relative text-center"
                    >
                        <div className="text-4xl sm:text-7xl font-black tracking-tighter text-black [-webkit-text-stroke:1px_#ef4444] drop-shadow-[0_0_24px_rgba(239,68,68,0.9)]">
                            HAOSHOKU HAKI
                        </div>
                        <div className="mt-3 font-mono text-xs sm:text-sm tracking-[0.4em] uppercase text-red-300/80">
                            Conqueror&apos;s Haki released · weak bugs fainted
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
