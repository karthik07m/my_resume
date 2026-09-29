'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sfx } from '@/lib/sfx'

interface BugItem {
    id: number
    x: number
    y: number
    dx: number
    dy: number
    isFixed: boolean
}

const GAME_SECONDS = 30
// Naruto: every 4 bugs releases one more tail. Nine tails is Kurama mode: faster spawns, orange screen.
// Nine tail paths fanning over the score counter, drawn in as tails are released.
const TAIL_PATHS = Array.from({ length: 9 }, (_, i) => {
    const a = ((-170 + i * 20) * Math.PI) / 180
    const ex = 50 + Math.cos(a) * 46, ey = 58 + Math.sin(a) * 46
    const cx = 50 + Math.cos(a + 0.55) * 28, cy = 58 + Math.sin(a + 0.55) * 28
    return `M 50 58 Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`
})
const BEASTS = ['Shukaku', 'Matatabi', 'Isobu', 'Son Gokū', 'Kokuō', 'Saiken', 'Chōmei', 'Gyūki', 'Kurama']
const BEST_KEY = 'bugsmasher-best'

const readBest = () => {
    try { return Number(localStorage.getItem(BEST_KEY)) || 0 } catch { return 0 }
}

export default function BugSmasher({ onClose }: { onClose: () => void }) {
    const [bugs, setBugs] = useState<BugItem[]>([])
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(GAME_SECONDS)
    const [storedBest, setStoredBest] = useState(readBest) // safe: this component only mounts client-side
    const best = Math.max(storedBest, score)
    const gameOver = timeLeft <= 0
    const tails = Math.min(9, Math.floor(score / 4))
    const kurama = tails === 9

    // Spawn bugs faster as time runs out
    useEffect(() => {
        if (gameOver) return
        const every = kurama ? 350 : timeLeft > 15 ? 800 : 500
        const spawn = setInterval(() => {
            setBugs((prev) => [...prev, {
                id: Date.now(),
                x: Math.random() * 80 + 10,
                y: Math.random() * 70 + 15,
                dx: Math.random() * 20 - 10,
                dy: Math.random() * 20 - 10,
                isFixed: false,
            }])
        }, every)
        return () => clearInterval(spawn)
    }, [gameOver, timeLeft, kurama])

    // Countdown
    useEffect(() => {
        const timer = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000)
        return () => clearInterval(timer)
    }, [])

    // Persist a new best when the round ends
    useEffect(() => {
        if (gameOver && score > storedBest) {
            try { localStorage.setItem(BEST_KEY, String(score)) } catch { /* private mode */ }
        }
    }, [gameOver, score, storedBest])

    // Close on Escape
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [onClose])

    const smashBug = useCallback((id: number) => {
        setBugs((prev) => prev.map((bug) => (bug.id === id ? { ...bug, isFixed: true } : bug)))
        setScore((s) => s + 1)
        sfx.pop()
        setTimeout(() => setBugs((prev) => prev.filter((bug) => bug.id !== id)), 500)
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className={`fixed inset-0 z-[100] ${kurama ? 'bg-orange-950/90' : 'bg-black/90'} backdrop-blur-sm overflow-hidden select-none touch-none transition-colors duration-700`}
            role="dialog"
            aria-label="Bug Smasher mini game"
        >
            {/* HUD */}
            <div className="absolute top-6 left-0 right-0 flex justify-between items-start px-6 sm:px-12 pointer-events-none">
                <div className="relative flex flex-col">
                    <svg viewBox="0 0 100 60" className="absolute -top-10 -left-8 w-36 h-24 pointer-events-none" aria-hidden>
                        {TAIL_PATHS.map((d, i) => (
                            <motion.path
                                key={d}
                                d={d}
                                fill="none"
                                stroke={kurama ? '#fde047' : '#fb923c'}
                                strokeWidth={5}
                                strokeLinecap="round"
                                initial={false}
                                animate={{ pathLength: i < tails ? 1 : 0, opacity: i < tails ? 0.9 : 0 }}
                                transition={{ duration: 0.45, ease: 'easeOut' }}
                                style={{ filter: 'drop-shadow(0 0 4px rgba(251,146,60,0.8))' }}
                            />
                        ))}
                    </svg>
                    <span className="relative text-xs text-white/50 uppercase tracking-widest">Bugs fixed</span>
                    <span className="relative text-4xl font-black text-orange-500 tabular-nums">{score}</span>
                    {best > 0 && <span className="text-xs text-white/40 font-mono">best {best}</span>}
                    {tails > 0 && (
                        <span className={`text-xs font-mono mt-1 ${kurama ? 'text-orange-300 animate-pulse font-bold' : 'text-orange-300/80'}`}>
                            {'🦊'} {tails}-Tails · {BEASTS[tails - 1]}{kurama && ' · KURAMA MODE'}
                        </span>
                    )}
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-xs text-white/50 uppercase tracking-widest">Time</span>
                    <span className={`text-4xl font-black tabular-nums ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                        {timeLeft}s
                    </span>
                </div>
                <button
                    onClick={onClose}
                    aria-label="Close game"
                    className="pointer-events-auto w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white text-xl leading-none"
                >
                    ✕
                </button>
            </div>

            {!gameOver && score === 0 && (
                <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/30 text-sm uppercase tracking-[0.3em] pointer-events-none text-center">
                    Tap the bugs
                </p>
            )}

            {/* Bugs */}
            <AnimatePresence>
                {bugs.map((bug) => (
                    <motion.button
                        key={bug.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, x: [0, bug.dx, 0], y: [0, bug.dy, 0] }}
                        exit={{ scale: 0, opacity: 0, transition: { duration: 0.15 } }}
                        transition={{ x: { repeat: Infinity, duration: 2 }, y: { repeat: Infinity, duration: 2.5 } }}
                        style={{ left: `${bug.x}%`, top: `${bug.y}%`, position: 'absolute' }}
                        onPointerDown={() => !bug.isFixed && smashBug(bug.id)}
                        className="-translate-x-1/2 -translate-y-1/2 p-3 text-4xl sm:text-5xl"
                        disabled={bug.isFixed || gameOver}
                        aria-label={bug.isFixed ? 'Fixed' : 'Bug'}
                    >
                        {bug.isFixed ? (
                            <motion.span initial={{ scale: 0.5 }} animate={{ scale: 1.2 }} className="block">✅</motion.span>
                        ) : (
                            <span className="block animate-bounce">🐛</span>
                        )}
                    </motion.button>
                ))}
            </AnimatePresence>

            {/* Game Over */}
            {gameOver && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 text-center px-6">
                    <h2 className="text-4xl sm:text-6xl font-black text-white mb-4">DEBUGGING COMPLETE</h2>
                    <p className="text-xl sm:text-2xl text-white/70 mb-2">
                        Bugs fixed: <span className="text-orange-500 font-bold">{score}</span>
                    </p>
                    <p className="text-sm text-white/40 font-mono mb-2">
                        {score > storedBest && score > 0 ? 'New personal best!' : `Personal best: ${best}`}
                    </p>
                    <p className="text-sm text-orange-300/80 font-mono mb-8">
                        {tails ? `Tailed beast released: ${BEASTS[tails - 1]} (${tails}-Tails)` : 'No tails released. Kurama is unimpressed.'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => { setStoredBest(best); setBugs([]); setScore(0); setTimeLeft(GAME_SECONDS) }}
                            className="px-8 py-4 bg-orange-500 text-black font-bold rounded-full hover:bg-orange-400 transition-colors"
                        >
                            PLAY AGAIN
                        </button>
                        <button
                            onClick={onClose}
                            className="px-8 py-4 border border-white/30 text-white font-bold rounded-full hover:bg-white/10 transition-colors"
                        >
                            RETURN TO MISSION
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    )
}
