'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MIN_MS = 700
const MAX_MS = 1500

// One line per franchise on the site, in page order, cycled while the page loads.
const LINES = [
    'Raising power level…',
    'Gathering chakra…',
    'Sharpening Wado Ichimonji…',
    '[SYSTEM] Loading Player data…',
    'Total Concentration Breathing…',
]

// The four stars on Goku's Dragon Ball, as a diamond.
const STAR = 'M0,-7 L1.7,-2.3 L6.7,-2.2 L2.7,0.9 L4.1,5.7 L0,2.8 L-4.1,5.7 L-2.7,0.9 L-6.7,-2.2 L-1.7,-2.3 Z'
const STARS = [[0, -10], [10, 0], [0, 10], [-10, 0]]

// Dragon Ball splash that covers the first paint while fonts, the star field and the 3D scene load.
// It opens onto the hero, which is Dragon Ball's.
export default function Loader() {
    const [done, setDone] = useState(false)
    const [line, setLine] = useState(0)

    useEffect(() => {
        // Both limits count from navigation start (where performance.now() is 0), not from hydration:
        // the splash is in the HTML, so it has usually been on screen long enough by the time this runs.
        const closeAt = (ms: number) => setTimeout(() => setDone(true), Math.max(0, ms - performance.now()))
        let finishTimer: ReturnType<typeof setTimeout> | undefined
        const finish = () => { finishTimer = closeAt(MIN_MS) }
        if (document.readyState === 'complete') finish()
        else window.addEventListener('load', finish, { once: true })
        const cap = closeAt(MAX_MS)
        const cycle = setInterval(() => setLine((l) => (l + 1) % LINES.length), 380)
        return () => {
            window.removeEventListener('load', finish)
            clearTimeout(finishTimer)
            clearTimeout(cap)
            clearInterval(cycle)
        }
    }, [])

    return (
        <AnimatePresence>
            {!done && (
                <motion.div
                    exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.4 } }}
                    className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center gap-8 px-8"
                    aria-busy="true"
                    aria-label="Loading"
                >
                    {/* The four-star ball. Its glow pulses in CSS, so it moves before the scripts arrive. */}
                    <div className="relative w-20 h-20" aria-hidden>
                        <div className="absolute inset-0 rounded-full motion-safe:animate-pulse shadow-[0_0_36px_rgba(249,115,22,0.85)]" />
                        <svg viewBox="-32 -32 64 64" className="relative w-full h-full">
                            <defs>
                                <radialGradient id="loader-ball" cx="36%" cy="30%" r="80%">
                                    <stop offset="0" stopColor="#fef3c7" />
                                    <stop offset="0.35" stopColor="#fb923c" />
                                    <stop offset="1" stopColor="#c2410c" />
                                </radialGradient>
                            </defs>
                            <circle r="30" fill="url(#loader-ball)" stroke="#7c2d12" strokeWidth="1.5" />
                            {STARS.map(([x, y]) => <path key={`${x}${y}`} d={STAR} transform={`translate(${x} ${y})`} fill="#dc2626" />)}
                            <ellipse cx="-11" cy="-15" rx="8" ry="4.5" fill="#fff" opacity="0.45" transform="rotate(-30 -11 -15)" />
                        </svg>
                    </div>

                    <div className="h-5 font-mono text-xs sm:text-sm tracking-[0.4em] uppercase text-orange-300">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={line}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.15 }}
                            >
                                {LINES[line]}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="w-full max-w-xs h-1 bg-white/10 overflow-hidden rounded-full">
                        <div className="h-full w-full origin-left motion-safe:animate-[loader-fill_0.7s_ease-in-out] bg-gradient-to-r from-orange-600 to-yellow-300 shadow-[0_0_12px_rgba(249,115,22,0.8)]" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
