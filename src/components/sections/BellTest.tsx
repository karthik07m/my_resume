'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { clsx } from 'clsx'
import { sfx } from '@/lib/sfx'
import { useLater } from './BossFight'

// Kakashi's bell test, Team 7's first day: two bells on red strings. They swing away from the pointer (Kakashi
// dodging without looking up from his book), and a grab misses the first couple of times. Keep at it and you catch
// them; catch both and you pass, because in the ninja world teamwork beats the rules.

const GRABS_TO_CATCH = 3 // the third grab at a bell catches it
const ANCHORS = [70, 170] // where each string hangs from the branch, in px across the box

function Bell() {
    return (
        <svg viewBox="0 0 40 44" className="w-9 h-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" aria-hidden>
            <path d="M 20 4 C 9 4 6 14 6 24 C 6 30 4 33 2 35 L 38 35 C 36 33 34 30 34 24 C 34 14 31 4 20 4 Z" fill="#facc15" stroke="#854d0e" strokeWidth={2} strokeLinejoin="round" />
            <path d="M 12 12 Q 14 8 19 7" fill="none" stroke="#fef9c3" strokeWidth={2} strokeLinecap="round" />
            <rect x={2} y={33} width={36} height={4} rx={2} fill="#eab308" stroke="#854d0e" strokeWidth={1.5} />
            <circle cx={20} cy={40} r={3.5} fill="#a16207" stroke="#854d0e" strokeWidth={1.5} />
            <circle cx={20} cy={3} r={2.5} fill="none" stroke="#854d0e" strokeWidth={1.5} />
        </svg>
    )
}

export default function BellTest() {
    const box = useRef<HTMLDivElement>(null)
    const later = useLater()
    const [swing, setSwing] = useState([0, 0]) // each bell's swing, in degrees
    const [grabs, setGrabs] = useState([0, 0])
    const [caught, setCaught] = useState([false, false])
    const [quip, setQuip] = useState<{ id: number; text: string; x: number } | null>(null)
    const passed = caught[0] && caught[1]
    const quips = useRef(0)

    const dodge = (i: number, dir: number, hard = false) => {
        setSwing((s) => s.map((v, j) => (j === i ? dir * (hard ? 62 : 38) : v)))
        later(() => setSwing((s) => s.map((v, j) => (j === i ? 0 : v))), hard ? 700 : 450)
    }
    // the bells swing away from a pointer that comes near them
    const onMove = (e: React.PointerEvent) => {
        if (e.pointerType !== 'mouse') return
        const r = box.current!.getBoundingClientRect()
        const x = e.clientX - r.left, y = e.clientY - r.top
        ANCHORS.forEach((ax, i) => {
            if (caught[i] || swing[i]) return
            const bx = ax, by = 62
            if (Math.hypot(x - bx, y - by) < 34) dodge(i, x < bx ? 1 : -1)
        })
    }
    const grab = (i: number) => {
        if (caught[i]) return
        const n = grabs[i] + 1
        setGrabs((g) => g.map((v, j) => (j === i ? n : v)))
        if (n < GRABS_TO_CATCH) {
            sfx.click()
            dodge(i, i ? -1 : 1, true)
            setQuip({ id: ++quips.current, text: n === 1 ? 'Too slow.' : 'Still reading. Try again.', x: ANCHORS[i] })
            return
        }
        sfx.levelUp()
        setCaught((c) => c.map((v, j) => (j === i ? true : v)))
        setQuip({ id: ++quips.current, text: 'Got one!', x: ANCHORS[i] })
    }
    const reset = () => { setCaught([false, false]); setGrabs([0, 0]); setQuip(null) }

    return (
        <div className="flex flex-col items-start sm:items-end gap-1">
            <div ref={box} onPointerMove={onMove} className="relative w-[240px] h-[104px] select-none">
                {/* the branch the bells hang from */}
                <div className="absolute left-3 right-3 top-2 h-2 rounded-full bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900" />
                {ANCHORS.map((ax, i) => (
                    <motion.div key={i} className="absolute top-3 w-0" style={{ left: ax, originY: 0 }} animate={{ rotate: caught[i] ? 0 : swing[i] }} transition={{ type: 'spring', stiffness: 140, damping: 7 }}>
                        <AnimatePresence>
                            {!caught[i] && (
                                <motion.button
                                    type="button"
                                    onClick={() => grab(i)}
                                    aria-label={`Grab bell ${i + 1} of 2`}
                                    exit={{ y: 60, opacity: 0, scale: 0.6 }}
                                    className="absolute left-0 top-0 -translate-x-1/2 flex flex-col items-center cursor-grab outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 rounded"
                                >
                                    <span className="block w-px h-9 bg-red-500" />
                                    <Bell />
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
                <AnimatePresence>
                    {quip && !passed && (
                        <motion.div key={quip.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: [0, 1, 1, 0], y: 0 }} transition={{ duration: 1.4, times: [0, 0.15, 0.75, 1] }} className="absolute bottom-0 -translate-x-1/2 whitespace-nowrap rounded bg-white px-2 py-0.5 text-[11px] font-black text-black" style={{ left: quip.x }}>
                            {quip.text}
                        </motion.div>
                    )}
                    {passed && (
                        <motion.div key="pass" initial={{ opacity: 0, scale: 1.6, rotate: -10 }} animate={{ opacity: 1, scale: 1, rotate: -4 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }} className="absolute inset-0 grid place-items-center">
                            <div className="rounded border-2 border-red-500 px-3 py-1 text-center text-red-400 bg-black/70">
                                <div className="text-2xl font-black leading-none">合格</div>
                                <div className="text-[10px] font-mono uppercase tracking-widest">You pass</div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <p className={clsx('max-w-[260px] font-mono text-[10px] uppercase tracking-[0.15em] sm:text-right', passed ? 'text-red-300' : 'text-orange-300/80')} aria-live="polite">
                {passed ? (
                    <>Teamwork over rules: Team 7 passes. <button type="button" onClick={reset} className="underline decoration-dotted underline-offset-2 hover:text-white">Again</button></>
                ) : (
                    <>鈴 · The bell test: take both of Kakashi&apos;s bells</>
                )}
            </p>
        </div>
    )
}
