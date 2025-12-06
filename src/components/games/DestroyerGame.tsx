'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Hammer, Crosshair, Flame, RefreshCcw, X, Bug } from 'lucide-react'

type WeaponType = 'hammer' | 'gun' | 'flamethrower'

interface Mark {
    id: number
    x: number
    y: number
    type: WeaponType
    rotation?: number
    scale?: number
}

interface BugEntity {
    id: number
    x: number
    y: number
    targetX: number
    targetY: number
    isDead: boolean
}

interface DestroyerGameProps {
    onClose: () => void
}

export default function DestroyerGame({ onClose }: DestroyerGameProps) {
    const [weapon, setWeapon] = useState<WeaponType>('hammer')
    const [marks, setMarks] = useState<Mark[]>([])
    const [bugs, setBugs] = useState<BugEntity[]>([])
    const containerRef = useRef<HTMLDivElement>(null)
    const requestRef = useRef<number | null>(null)

    // Sound effects (simulated with console for now, could add real audio)
    const playSound = (type: WeaponType) => {
        // In a real app, new Audio(`/sounds/${type}.mp3`).play()
    }

    // Handle clicks for destruction
    const handleClick = (e: React.MouseEvent) => {
        const x = e.clientX
        const y = e.clientY

        playSound(weapon)

        // Weapon specific logic
        if (weapon === 'hammer') {
            // Add crack mark
            const newMark: Mark = {
                id: Date.now(),
                x,
                y,
                type: 'hammer',
                rotation: Math.random() * 360,
                scale: 0.5 + Math.random() * 1
            }
            setMarks(prev => [...prev, newMark])

            // Break element
            const overlay = containerRef.current
            if (overlay) overlay.style.pointerEvents = 'none'
            const target = document.elementFromPoint(x, y) as HTMLElement
            if (overlay) overlay.style.pointerEvents = 'auto'

            // Safe tags to destroy
            const safeTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'BUTTON', 'A', 'IMG', 'SVG', 'LI', 'STRONG', 'EM', 'I', 'B']

            if (target &&
                safeTags.includes(target.tagName) &&
                !target.id.includes('root') &&
                !target.id.includes('next')
            ) {
                console.log('Smashing:', target)
                target.style.transition = 'transform 0.1s'
                target.style.transform = `
                    translate(${(Math.random() - 0.5) * 20}px, ${(Math.random() - 0.5) * 20}px) 
                    rotate(${(Math.random() - 0.5) * 45}deg)
                    skew(${(Math.random() - 0.5) * 20}deg)
                `
                target.style.filter = 'sepia(1) contrast(2)'
            } else {
                console.log('Safe target hit (ignored):', target)
            }
        } else if (weapon === 'gun') {
            // Check if hit a bug
            const hitBug = bugs.find(b =>
                !b.isDead &&
                Math.abs(b.x - x) < 40 &&
                Math.abs(b.y - y) < 40
            )

            if (hitBug) {
                setBugs(prev => prev.map(b => b.id === hitBug.id ? { ...b, isDead: true } : b))
                // Remove dead bug after animation
                setTimeout(() => {
                    setBugs(prev => prev.filter(b => b.id !== hitBug.id))
                }, 500)
            } else {
                // Add bullet hole
                setMarks(prev => [...prev, {
                    id: Date.now(),
                    x,
                    y,
                    type: 'gun',
                    rotation: Math.random() * 360
                }])
            }
        } else if (weapon === 'flamethrower') {
            // Add burn mark
            setMarks(prev => [...prev, {
                id: Date.now(),
                x,
                y,
                type: 'flamethrower',
                scale: 1 + Math.random() * 2
            }])
        }
    }

    // Bug Logic: Spawn and Move
    useEffect(() => {
        const spawnInterval = setInterval(() => {
            if (bugs.length < 10) {
                const startX = Math.random() * window.innerWidth
                const startY = Math.random() * window.innerHeight

                // Find a random target element to "eat" (prefer text/visible content)
                const allElements = Array.from(document.querySelectorAll('p, h1, h2, h3, h4, h5, span, button, a'))
                const visibleElements = allElements.filter(el => {
                    const rect = el.getBoundingClientRect()
                    return rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.bottom <= window.innerHeight
                })

                const targetEl = visibleElements[Math.floor(Math.random() * visibleElements.length)] as HTMLElement
                const rect = targetEl?.getBoundingClientRect()

                if (rect) {
                    setBugs(prev => [...prev, {
                        id: Date.now(),
                        x: startX,
                        y: startY,
                        targetX: rect.left + rect.width / 2,
                        targetY: rect.top + rect.height / 2,
                        isDead: false
                    }])
                }
            }
        }, 2000)

        return () => clearInterval(spawnInterval)
    }, [bugs.length])

    // Game Loop for Bug Movement
    const updateBugs = useCallback(() => {
        setBugs(prevBugs => {
            return prevBugs.map(bug => {
                if (bug.isDead) return bug

                const dx = bug.targetX - bug.x
                const dy = bug.targetY - bug.y
                const dist = Math.sqrt(dx * dx + dy * dy)

                if (dist < 5) {
                    // Reached target -> Eat it!
                    const overlay = containerRef.current
                    if (overlay) overlay.style.pointerEvents = 'none'
                    const target = document.elementFromPoint(bug.targetX, bug.targetY) as HTMLElement
                    if (overlay) overlay.style.pointerEvents = 'auto'

                    // Safe tags to eat
                    const safeTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'BUTTON', 'A', 'IMG', 'SVG', 'LI', 'STRONG', 'EM', 'I', 'B']

                    if (target &&
                        safeTags.includes(target.tagName) &&
                        !target.id.includes('root') &&
                        !target.id.includes('next')
                    ) {
                        target.style.transition = 'opacity 0.5s, transform 0.5s'
                        target.style.opacity = '0'
                        target.style.transform = 'scale(0)'
                    }

                    // Pick new target
                    return {
                        ...bug,
                        targetX: Math.random() * window.innerWidth,
                        targetY: Math.random() * window.innerHeight
                    }
                }

                // Move towards target
                const speed = 3
                return {
                    ...bug,
                    x: bug.x + (dx / dist) * speed,
                    y: bug.y + (dy / dist) * speed
                }
            })
        })
        requestRef.current = requestAnimationFrame(updateBugs)
    }, [])

    useEffect(() => {
        requestRef.current = requestAnimationFrame(updateBugs)
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current)
        }
    }, [updateBugs])

    // Reset page
    const resetDestruction = () => {
        setMarks([])
        setBugs([])
        const allElements = document.querySelectorAll('*')
        allElements.forEach((el) => {
            if (el instanceof HTMLElement) {
                el.style.transform = ''
                el.style.filter = ''
                el.style.opacity = ''
                el.style.transition = ''
            }
        })
    }

    useEffect(() => {
        return () => resetDestruction()
    }, [])

    return (
        <div
            ref={containerRef}
            className={`fixed inset-0 z-[100] overflow-hidden ${weapon === 'gun' ? 'cursor-crosshair' : 'cursor-none'}`}
            onClick={handleClick}
        >
            {/* Custom Cursor for Hammer/Flamethrower */}
            {weapon === 'hammer' && (
                <div
                    className="fixed pointer-events-none z-[102] text-6xl -translate-x-1/2 -translate-y-1/2 drop-shadow-2xl"
                    style={{ left: 0, top: 0 }} // We'd need mouse tracking for this to work perfectly, skipping for now to rely on click effects
                />
            )}

            {/* Marks Layer */}
            {marks.map(mark => (
                <div
                    key={mark.id}
                    className="absolute pointer-events-none"
                    style={{ left: mark.x, top: mark.y }}
                >
                    {mark.type === 'gun' && (
                        <div className="w-3 h-3 bg-black rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[inset_0_0_5px_rgba(0,0,0,1)] border border-gray-600" />
                    )}
                    {mark.type === 'flamethrower' && (
                        <div className="relative -translate-x-1/2 -translate-y-1/2">
                            <div
                                className="w-32 h-32 rounded-full blur-xl animate-pulse"
                                style={{ background: 'radial-gradient(circle, rgba(255,100,0,0.6) 0%, transparent 70%)' }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-4xl animate-bounce">🔥</div>
                        </div>
                    )}
                    {mark.type === 'hammer' && (
                        <div
                            className="absolute -translate-x-1/2 -translate-y-1/2"
                            style={{ transform: `rotate(${mark.rotation}deg) scale(${mark.scale})` }}
                        >
                            {/* Cracks SVG */}
                            <svg width="100" height="100" viewBox="0 0 100 100" className="opacity-80 drop-shadow-lg">
                                <path d="M50 50 L20 20 M50 50 L80 20 M50 50 L20 80 M50 50 L80 80 M50 50 L50 10 M50 50 L90 50" stroke="rgba(255,255,255,0.8)" strokeWidth="2" fill="none" />
                                <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="none" strokeDasharray="5,5" />
                            </svg>
                        </div>
                    )}
                </div>
            ))}

            {/* Bugs Layer */}
            <AnimatePresence>
                {bugs.map(bug => (
                    <motion.div
                        key={bug.id}
                        initial={{ scale: 0 }}
                        animate={{
                            scale: bug.isDead ? 2 : 1,
                            opacity: bug.isDead ? 0 : 1,
                            rotate: Math.atan2(bug.targetY - bug.y, bug.targetX - bug.x) * (180 / Math.PI) + 90
                        }}
                        exit={{ scale: 0 }}
                        className="absolute pointer-events-none text-red-500 drop-shadow-lg z-[101]"
                        style={{ left: bug.x, top: bug.y, width: 40, height: 40, marginLeft: -20, marginTop: -20 }}
                    >
                        {bug.isDead ? (
                            <div className="text-green-500 font-black text-2xl">SPLAT!</div>
                        ) : (
                            <Bug className="w-full h-full animate-pulse" />
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Toolbar */}
            <div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 p-4 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => setWeapon('hammer')}
                    className={`group relative p-4 rounded-xl transition-all ${weapon === 'hammer' ? 'bg-orange-500 text-black scale-110 shadow-[0_0_20px_rgba(249,115,22,0.5)]' : 'text-white hover:bg-white/10'}`}
                >
                    <Hammer className="w-8 h-8" />
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        SMASH
                    </span>
                </button>
                <button
                    onClick={() => setWeapon('gun')}
                    className={`group relative p-4 rounded-xl transition-all ${weapon === 'gun' ? 'bg-orange-500 text-black scale-110 shadow-[0_0_20px_rgba(249,115,22,0.5)]' : 'text-white hover:bg-white/10'}`}
                >
                    <Crosshair className="w-8 h-8" />
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        SHOOT
                    </span>
                </button>
                <button
                    onClick={() => setWeapon('flamethrower')}
                    className={`group relative p-4 rounded-xl transition-all ${weapon === 'flamethrower' ? 'bg-orange-500 text-black scale-110 shadow-[0_0_20px_rgba(249,115,22,0.5)]' : 'text-white hover:bg-white/10'}`}
                >
                    <Flame className="w-8 h-8" />
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        BURN
                    </span>
                </button>

                <div className="w-px h-10 bg-white/20 mx-2" />

                <button
                    onClick={resetDestruction}
                    className="p-4 rounded-xl text-white hover:bg-white/10 transition-all hover:rotate-180"
                    title="Reset Page"
                >
                    <RefreshCcw className="w-8 h-8" />
                </button>
                <button
                    onClick={onClose}
                    className="p-4 rounded-xl text-red-500 hover:bg-red-500/10 transition-all hover:scale-110"
                    title="Exit Game"
                >
                    <X className="w-8 h-8" />
                </button>
            </div>
        </div>
    )
}
