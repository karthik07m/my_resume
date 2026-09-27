'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const MIN_MS = 900
const MAX_MS = 3000

// "Gathering chakra" splash that covers the first paint while fonts, the star field and the 3D scene load.
export default function Loader() {
    const [done, setDone] = useState(false)

    useEffect(() => {
        const start = performance.now()
        let finishTimer: ReturnType<typeof setTimeout> | undefined
        const finish = () => {
            finishTimer = setTimeout(() => setDone(true), Math.max(0, MIN_MS - (performance.now() - start)))
        }
        if (document.readyState === 'complete') finish()
        else window.addEventListener('load', finish, { once: true })
        const cap = setTimeout(() => setDone(true), MAX_MS)
        return () => {
            window.removeEventListener('load', finish)
            clearTimeout(finishTimer)
            clearTimeout(cap)
        }
    }, [])

    return (
        <AnimatePresence>
            {!done && (
                <motion.div
                    exit={{ opacity: 0, transition: { duration: 0.4 } }}
                    className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center gap-6 px-8"
                    aria-busy="true"
                    aria-label="Loading"
                >
                    <div className="font-mono text-xs sm:text-sm tracking-[0.4em] uppercase text-green-400 animate-pulse">
                        Gathering chakra…
                    </div>
                    <div className="w-full max-w-xs h-1 bg-white/10 overflow-hidden rounded-full">
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: MIN_MS / 1000, ease: 'easeInOut' }}
                            style={{ transformOrigin: '0% 50%' }}
                            className="h-full w-full bg-gradient-to-r from-green-500 to-teal-400 shadow-[0_0_12px_rgba(34,197,94,0.8)]"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
