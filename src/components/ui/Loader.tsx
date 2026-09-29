'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MIN_MS = 900
const MAX_MS = 3000

// One line per franchise on the site, cycled while the page loads.
const LINES = [
    'Gathering chakra…',
    'Weaving hand seals…',
    'Sharpening Wado Ichimonji…',
    'Entering the Zone…',
    '[SYSTEM] Loading Player data…',
    'Total Concentration Breathing…',
    'Mangekyō awakening…',
]

// Sharingan splash that covers the first paint while fonts, the star field and the 3D scene load.
export default function Loader() {
    const [done, setDone] = useState(false)
    const [line, setLine] = useState(0)

    useEffect(() => {
        const start = performance.now()
        let finishTimer: ReturnType<typeof setTimeout> | undefined
        const finish = () => {
            finishTimer = setTimeout(() => setDone(true), Math.max(0, MIN_MS - (performance.now() - start)))
        }
        if (document.readyState === 'complete') finish()
        else window.addEventListener('load', finish, { once: true })
        const cap = setTimeout(() => setDone(true), MAX_MS)
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
                    {/* Sharingan: red iris, three tomoe spinning, faster as the bar fills */}
                    <div className="relative w-20 h-20 rounded-full bg-red-600 border-4 border-black shadow-[0_0_30px_rgba(239,68,68,0.7),inset_0_0_12px_rgba(0,0,0,0.6)]" aria-hidden>
                        <div className="absolute inset-0 rounded-full border-2 border-black/60" />
                        <motion.div
                            className="absolute inset-0"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                        >
                            {[0, 120, 240].map((deg) => (
                                <span
                                    key={deg}
                                    className="absolute left-1/2 top-1/2 w-3.5 h-3.5 -ml-[7px] -mt-[7px] rounded-full bg-black"
                                    style={{ transform: `rotate(${deg}deg) translateY(-22px)` }}
                                />
                            ))}
                        </motion.div>
                        <div className="absolute left-1/2 top-1/2 w-5 h-5 -ml-2.5 -mt-2.5 rounded-full bg-black" />
                    </div>

                    <div className="h-5 font-mono text-xs sm:text-sm tracking-[0.4em] uppercase text-red-300">
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
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: MIN_MS / 1000, ease: 'easeInOut' }}
                            style={{ transformOrigin: '0% 50%' }}
                            className="h-full w-full bg-gradient-to-r from-red-600 to-orange-400 shadow-[0_0_12px_rgba(239,68,68,0.8)]"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
