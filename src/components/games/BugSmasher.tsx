'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bug, CheckCircle2, X } from 'lucide-react'

interface BugItem {
    id: number
    x: number
    y: number
    isFixed: boolean
}

interface BugSmasherProps {
    onClose: () => void
}

export default function BugSmasher({ onClose }: BugSmasherProps) {
    const [bugs, setBugs] = useState<BugItem[]>([])
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(30)
    const [gameOver, setGameOver] = useState(false)

    // Spawn bugs
    useEffect(() => {
        if (gameOver) return

        const spawnInterval = setInterval(() => {
            const newBug: BugItem = {
                id: Date.now(),
                x: Math.random() * 80 + 10, // 10% to 90% width
                y: Math.random() * 80 + 10, // 10% to 90% height
                isFixed: false
            }
            setBugs(prev => [...prev, newBug])
        }, 800)

        return () => clearInterval(spawnInterval)
    }, [gameOver])

    // Timer
    useEffect(() => {
        if (timeLeft <= 0) {
            setGameOver(true)
            return
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [timeLeft])

    const smashBug = useCallback((id: number) => {
        setBugs(prev => prev.map(bug =>
            bug.id === id ? { ...bug, isFixed: true } : bug
        ))
        setScore(prev => prev + 1)

        // Remove fixed bug after animation
        setTimeout(() => {
            setBugs(prev => prev.filter(bug => bug.id !== id))
        }, 500)
    }, [])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center overflow-hidden"
        >
            {/* Game UI */}
            <div className="absolute top-8 left-0 right-0 flex justify-between px-12 pointer-events-none">
                <div className="flex flex-col items-center">
                    <span className="text-sm text-white/50 uppercase tracking-widest">Score</span>
                    <span className="text-4xl font-black text-orange-500">{score}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-sm text-white/50 uppercase tracking-widest">Time</span>
                    <span className={`text-4xl font-black ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                        {timeLeft}s
                    </span>
                </div>
            </div>

            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-8 right-8 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-50"
            >
                <X className="w-6 h-6 text-white" />
            </button>

            {/* Game Over Screen */}
            {gameOver && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90">
                    <h2 className="text-6xl font-black text-white mb-4">DEBUGGING COMPLETE</h2>
                    <p className="text-2xl text-white/70 mb-8">Bugs Fixed: <span className="text-orange-500 font-bold">{score}</span></p>
                    <button
                        onClick={onClose}
                        className="px-8 py-4 bg-orange-500 text-black font-bold rounded-full hover:bg-orange-400 transition-colors"
                    >
                        RETURN TO MISSION
                    </button>
                </div>
            )}

            {/* Bugs */}
            <AnimatePresence>
                {bugs.map(bug => (
                    <motion.button
                        key={bug.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            x: [0, Math.random() * 20 - 10, 0],
                            y: [0, Math.random() * 20 - 10, 0]
                        }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{
                            x: { repeat: Infinity, duration: 2 },
                            y: { repeat: Infinity, duration: 2.5 }
                        }}
                        style={{
                            left: `${bug.x}%`,
                            top: `${bug.y}%`,
                            position: 'absolute'
                        }}
                        onClick={() => !bug.isFixed && smashBug(bug.id)}
                        className="p-4 group"
                        disabled={bug.isFixed || gameOver}
                    >
                        {bug.isFixed ? (
                            <motion.div
                                initial={{ scale: 0.5 }}
                                animate={{ scale: 1.2 }}
                                className="text-green-500"
                            >
                                <CheckCircle2 className="w-12 h-12" />
                            </motion.div>
                        ) : (
                            <div className="text-red-500 group-hover:text-red-400 transition-colors">
                                <Bug className="w-10 h-10 animate-bounce" />
                            </div>
                        )}
                    </motion.button>
                ))}
            </AnimatePresence>
        </motion.div>
    )
}
