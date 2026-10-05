'use client'

import { AnimatePresence, motion, useAnimationControls, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import resume from '@/data/resume.json'
import { sfx } from '@/lib/sfx'
import { useSage } from '@/components/ui/SageMode'
import { makeRand, useLater } from './BossFight'

// About's skills, one card per group, each a moment Naruto fans know, played with your hands rather than named:
// - Appian: Jiraiya's Rasengan training. Hold to burst the water balloon, then the rubber ball; on the third the
//   Rasengan forms and slams across the card. After that a tap throws it (a Rasenshuriken in Sage Mode).
// - Databases: Chidori. Hold to charge it, chirping like a thousand birds; it fires when it is full.
// - Fire a Rasengan and a Chidori close together and they meet between the two cards: the Valley of the End.
// - Full-stack: Kakashi. Tap to lift his forehead protector off the Sharingan, which copies the skill list to your
//   clipboard. Three quick taps: 千年殺し, the Thousand Years of Death.
// - Tools & Cloud: Sakura. Tap: SHANNAROO! The card cracks and the skills jump.
// No faces are drawn. The emblems only animate while the section is on screen (`live`).

const HOLD_MS = 1200 // how long a charged technique takes
const CLASH_MS = 1800 // fire the other one within this long for the Valley of the End

type Kind = 'rasengan' | 'chidori' | 'kakashi' | 'sakura'
const CARDS: { kind: Kind; name: string; kanji: string; owner: string; why: string; tint: string }[] = [
    { kind: 'rasengan', name: 'Rasengan', kanji: '螺旋丸', owner: 'Naruto Uzumaki', why: 'No hand seals, just practice, the way Jiraiya taught it: three steps, over and over.', tint: '#38bdf8' },
    { kind: 'chidori', name: 'Chidori', kanji: '千鳥', owner: 'Sasuke Uchiha', why: 'Charged, fast, and it lands exactly where it is aimed.', tint: '#93c5fd' },
    { kind: 'kakashi', name: 'Sharingan', kanji: '写輪眼', owner: 'Kakashi Hatake', why: 'The Copy Ninja: a thousand techniques, learned by eye.', tint: '#f87171' },
    { kind: 'sakura', name: 'Cherry Blossom Impact', kanji: '桜花衝', owner: 'Sakura Haruno', why: 'Precise chakra control, then a lot of force exactly where it counts.', tint: '#f472b6' },
]

const paused = (live: boolean) => !live && '[animation-play-state:paused]'

/* ───────────── emblems ───────────── */

function RasenganOrb({ live, awake }: { live: boolean; awake: boolean }) {
    return (
        <span className="relative block w-full h-full rounded-full shadow-[0_0_30px_rgba(56,189,248,0.8)]" style={{ background: 'radial-gradient(circle at 38% 32%, #fff 0%, #e0f2fe 16%, #38bdf8 46%, #1d4ed8 78%, #1e3a8a 100%)' }}>
            <svg viewBox="0 0 100 100" className={clsx('absolute inset-0 w-full h-full overflow-visible animate-[spin_1.6s_linear_infinite]', paused(live))} aria-hidden>
                {/* in Sage Mode it is the Rasenshuriken: four blades of wind round the sphere */}
                {awake && [0, 90, 180, 270].map((deg) => (
                    <path key={deg} d="M 50 12 Q 76 -8 102 6 Q 80 5 66 20 Z" transform={`rotate(${deg} 50 50)`} fill="#f0f9ff" stroke="#38bdf8" strokeWidth="1.5" strokeLinejoin="round" />
                ))}
                {Array.from({ length: 8 }, (_, i) => (
                    <path key={i} d="M 50 13 Q 80 14 84 46" transform={`rotate(${i * 45} 50 50)`} fill="none" stroke="#fff" strokeOpacity={i % 2 ? 0.5 : 0.85} strokeWidth={i % 2 ? 1.6 : 2.6} strokeLinecap="round" />
                ))}
            </svg>
            <span className="absolute inset-[36%] rounded-full bg-white blur-[3px]" />
        </span>
    )
}

// The training props: a water balloon (step 1) and a rubber ball (step 2). `strain` is 0..1 while it is being held.
function Balloon({ strain }: { strain: number }) {
    return (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" aria-hidden>
            <path d="M 50 12 C 76 12 86 36 82 56 C 78 74 64 84 50 84 C 36 84 22 74 18 56 C 14 36 24 12 50 12 Z" fill="#38bdf8" fillOpacity={0.8} stroke="#0c4a6e" strokeWidth={2.5} />
            <path d="M 45 84 L 50 93 L 55 84 Z" fill="#0ea5e9" stroke="#0c4a6e" strokeWidth={2} strokeLinejoin="round" />
            <ellipse cx={36} cy={32} rx={8} ry={12} fill="#fff" opacity={0.55} transform="rotate(-25 36 32)" />
            {/* the water inside churning as the chakra spins it */}
            {strain > 0 && <path d="M 28 56 Q 40 44 50 56 T 72 56" fill="none" stroke="#e0f2fe" strokeWidth={3} strokeLinecap="round" opacity={0.4 + strain * 0.6} />}
        </svg>
    )
}
function RubberBall({ strain }: { strain: number }) {
    return (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" aria-hidden>
            <circle cx={50} cy={50} r={36} fill="#dc2626" stroke="#450a0a" strokeWidth={2.5} />
            <path d="M 18 40 Q 50 56 82 40" fill="none" stroke="#7f1d1d" strokeWidth={2} />
            <ellipse cx={38} cy={34} rx={8} ry={5} fill="#fff" opacity={0.45} transform="rotate(-30 38 34)" />
            {/* splitting under the pressure */}
            {strain > 0.35 && <path d="M 50 18 L 46 30 L 54 38 L 48 48" fill="none" stroke="#fde68a" strokeWidth={2.5} strokeLinejoin="round" opacity={strain} />}
            {strain > 0.65 && <path d="M 76 60 L 66 62 L 64 72 L 56 74 M 26 62 L 34 66 L 32 76" fill="none" stroke="#fde68a" strokeWidth={2.5} strokeLinejoin="round" opacity={strain} />}
        </svg>
    )
}

const BOLTS = [0, 1].map((set) => {
    const rand = makeRand(set * 53 + 9)
    return Array.from({ length: 9 }, (_, b) => {
        const a = ((b + set * 0.5) / 9) * Math.PI * 2
        let r = 10, d = `M ${(50 + Math.cos(a) * r).toFixed(1)} ${(50 + Math.sin(a) * r).toFixed(1)}`
        while (r < 44) {
            r += 6 + rand() * 7
            const wob = a + (rand() - 0.5) * 0.5
            d += ` L ${(50 + Math.cos(wob) * r).toFixed(1)} ${(50 + Math.sin(wob) * r).toFixed(1)}`
        }
        return d
    })
})
function ChidoriOrb({ live, charge }: { live: boolean; charge: boolean }) {
    return (
        <span className="relative block w-full h-full rounded-full shadow-[0_0_30px_rgba(147,197,253,0.7)]" style={{ background: 'radial-gradient(circle, #fff 0%, #dbeafe 14%, #60a5fa 32%, #1e3a8a 62%, #0b1026 100%)' }}>
            {BOLTS.map((set, s) => (
                <svg key={s} viewBox="0 0 100 100" className={clsx('absolute inset-0 w-full h-full overflow-visible', s > 0 && (charge ? 'animate-[ki-bolt_0.18s_steps(1)_infinite]' : 'animate-[ki-bolt_0.7s_steps(1)_infinite]'), s > 0 && paused(live))} aria-hidden>
                    {set.map((d, b) => <path key={d} d={d} fill="none" stroke={b % 2 ? '#fff' : '#bfdbfe'} strokeWidth={b % 3 ? 1.6 : 2.6} strokeLinejoin="round" strokeLinecap="round" transform={charge ? 'translate(50 50) scale(1.35) translate(-50 -50)' : undefined} />)}
                </svg>
            ))}
        </span>
    )
}

const BLADE = 'M 50 41 C 60 20 80 16 92 26 C 76 26 66 38 59 52 C 56 47 53 43 50 41 Z'
const TOMOE = 'M 6.5 0 A 6.5 6.5 0 1 1 -6.5 0 A 6.5 6.5 0 1 1 6.5 0 Z M 0 -6.5 Q -16 -9 -21.2 12.7 Q -13 3 -6.1 2.2 Z'
export function SharinganEye({ live, awake, glow = true }: { live: boolean; awake: boolean; glow?: boolean }) {
    return (
        <span className={clsx('relative block w-full h-full rounded-full', glow && 'shadow-[0_0_30px_rgba(239,68,68,0.65)]')} style={{ background: 'radial-gradient(circle, #ef4444 0%, #dc2626 45%, #991b1b 78%, #450a0a 92%, #0a0a0a 93%)' }}>
            <svg viewBox="0 0 100 100" className={clsx('absolute inset-0 w-full h-full', awake ? 'animate-[spin_14s_linear_infinite]' : 'animate-[spin_7s_linear_infinite]', paused(live))} aria-hidden>
                {awake ? (
                    [0, 120, 240].map((deg) => <path key={deg} d={BLADE} transform={`rotate(${deg} 50 50)`} fill="#0a0a0a" />)
                ) : (
                    <>
                        <circle cx="50" cy="50" r="24" fill="none" stroke="#450a0a" strokeWidth="1.6" />
                        {[0, 120, 240].map((deg) => <path key={deg} d={TOMOE} transform={`rotate(${deg} 50 50) translate(50 26)`} fill="#0a0a0a" />)}
                    </>
                )}
            </svg>
            <span className="absolute inset-[42%] rounded-full bg-[#0a0a0a]" />
            <span className="absolute left-[24%] top-[18%] w-[20%] h-[12%] rounded-full bg-white/25 blur-[2px]" />
        </span>
    )
}
// Kakashi's forehead protector, slanted down over his left eye: cloth band, metal plate, the Leaf engraved on it.
function Headband() {
    return (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" aria-hidden>
            <path d="M -14 30 L 114 12 L 114 50 L -14 68 Z" fill="#1e293b" stroke="#0f172a" strokeWidth={2} />
            <path d="M 10 30 L 90 19 L 92 57 L 12 68 Z" fill="#cbd5e1" stroke="#475569" strokeWidth={2.5} strokeLinejoin="round" />
            <circle cx={18} cy={36} r={2} fill="#64748b" /><circle cx={84} cy={27} r={2} fill="#64748b" /><circle cx={20} cy={60} r={2} fill="#64748b" /><circle cx={86} cy={51} r={2} fill="#64748b" />
            {/* the Leaf: a spiral running out into a point */}
            <g transform="translate(51 43) rotate(-8) scale(1.25)" fill="none" stroke="#334155" strokeWidth={2.4} strokeLinecap="round">
                <path d="M 0 0 a 2 2 0 0 1 4 0 a 4.5 4.5 0 0 1 -9 0 a 7 7 0 0 1 14 0 a 9.5 9.5 0 0 1 -16 6.5" />
                <path d="M -7 6.5 L -15 11 L -12 2" fill="#334155" />
            </g>
        </svg>
    )
}
// Sakura's mark: a cherry blossom.
function Blossom({ live }: { live: boolean }) {
    return (
        <span className="relative block w-full h-full rounded-full shadow-[0_0_28px_rgba(244,114,182,0.6)]" style={{ background: 'radial-gradient(circle, #500724 0%, #1f0613 66%, #0a0a0a 100%)' }}>
            <svg viewBox="0 0 100 100" className={clsx('absolute inset-0 w-full h-full animate-[spin_24s_linear_infinite]', paused(live))} aria-hidden>
                {[0, 72, 144, 216, 288].map((deg) => (
                    <path key={deg} d="M 50 50 C 36 38 36 16 46 12 L 50 18 L 54 12 C 64 16 64 38 50 50 Z" transform={`rotate(${deg} 50 50)`} fill="#f9a8d4" stroke="#9d174d" strokeWidth={1.6} strokeLinejoin="round" />
                ))}
                <circle cx={50} cy={50} r={7} fill="#fde047" stroke="#9d174d" strokeWidth={1.4} />
            </svg>
        </span>
    )
}

/* ───────────── what goes off over a card ───────────── */

const jag = (rand: () => number, x: number, y: number, angle: number, steps: number, step: number) => {
    let d = `M ${x.toFixed(1)} ${y.toFixed(1)}`
    for (let i = 0; i < steps; i++) {
        const a = angle + (rand() - 0.5) * 1.1
        x += Math.cos(a) * step * (0.6 + rand() * 0.8)
        y += Math.sin(a) * step * (0.6 + rand() * 0.8)
        d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`
    }
    return d
}

type Fx = 'pop' | 'burst' | 'rasengan' | 'chidori' | 'fizzle' | 'copy' | 'poke' | 'shannaroo'
const SHOUT: Record<Fx, [string, string]> = {
    pop: ['Pop!', 'Step 1 cleared: the water balloon'],
    burst: ['Bang!', 'Step 2 cleared: the rubber ball'],
    rasengan: ['Rasengan!', '螺旋丸'],
    chidori: ['Chidori!', '千鳥'],
    fizzle: ['…fizzle', 'Not enough chakra: hold it longer'],
    copy: ['Copied!', 'Skill list copied to your clipboard'],
    poke: ['千年殺し!!', 'Thousand Years of Death'],
    shannaroo: ['Shannaroo!', 'しゃーんなろー!'],
}
const COLOR: Record<Fx, string> = { pop: 'text-sky-200', burst: 'text-red-300', rasengan: 'text-sky-200', chidori: 'text-blue-200', fizzle: 'text-white/70', copy: 'text-red-300', poke: 'text-amber-200', shannaroo: 'text-pink-300' }

function CardFx({ fx, seed, sage }: { fx: Fx; seed: number; sage: boolean }) {
    const rand = makeRand(seed * 131 + 17)
    const [big, small] = fx === 'rasengan' && sage ? ['Rasenshuriken!', '螺旋手裏剣'] : SHOUT[fx]
    return (
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none" aria-hidden>
            {/* the water balloon bursting: droplets thrown out from the emblem */}
            {(fx === 'pop' || fx === 'burst') && Array.from({ length: 16 }, (_, i) => {
                const a = (i / 16) * Math.PI * 2, d = 50 + rand() * 70
                return <motion.span key={i} className={clsx('absolute left-[52px] top-[52px] w-2.5 h-2.5 rounded-full', fx === 'pop' ? 'bg-sky-300' : 'bg-red-400')} initial={{ x: 0, y: 0, opacity: 1 }} animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d + 20, opacity: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }} />
            })}
            {fx === 'rasengan' && (
                <motion.div className="absolute top-1/2 w-16 h-16 -mt-8 -ml-8 rounded-full shadow-[0_0_32px_#38bdf8]" style={{ background: 'conic-gradient(from 0deg, #fff, #38bdf8, #1d4ed8, #fff, #38bdf8, #1d4ed8, #fff)' }} initial={{ left: '14%', scale: 0.4, opacity: 0, rotate: 0 }} animate={{ left: ['14%', '14%', '94%'], scale: [0.4, 1, 2.2], opacity: [0, 1, 0], rotate: 1440 }} transition={{ duration: 1.1, times: [0, 0.3, 1], ease: 'easeIn' }}>
                    <div className="absolute inset-[22%] rounded-full bg-white/90 blur-[2px]" />
                </motion.div>
            )}
            <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                {fx === 'chidori' && Array.from({ length: 8 }, (_, b) => (
                    <motion.path key={b} d={jag(rand, 12, 12 + rand() * 14, (rand() - 0.5) * 0.5, 12, 8)} fill="none" stroke={b % 2 ? '#e0f2fe' : '#38bdf8'} strokeWidth={b % 2 ? 1.5 : 2.5} vectorEffect="non-scaling-stroke" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.2, 1, 0.4, 0] }} transition={{ duration: 0.8, delay: b * 0.05 }} />
                ))}
                {/* Sakura's punch: the card cracks outwards from where her fist came down */}
                {fx === 'shannaroo' && Array.from({ length: 9 }, (_, b) => (
                    <motion.path key={b} d={jag(rand, 12, 14, (b / 9) * Math.PI * 1.6 - 0.9, 9, 6)} fill="none" stroke="#fbcfe8" strokeWidth={2} vectorEffect="non-scaling-stroke" initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: 1, opacity: [1, 1, 0] }} transition={{ duration: 1.4, times: [0, 0.6, 1], ease: 'easeOut' }} />
                ))}
            </svg>
            <motion.div className="absolute inset-0 grid place-items-center text-center" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.15, 1, 1] }} transition={{ duration: 1.5, times: [0, 0.15, 0.75, 1], delay: fx === 'rasengan' ? 0.3 : 0 }}>
                <div>
                    <div className={clsx('text-3xl sm:text-4xl font-black italic uppercase [-webkit-text-stroke:1.5px_#000] drop-shadow-[3px_3px_0_#000]', COLOR[fx])}>{big}</div>
                    <div className="mt-1 text-[11px] font-mono uppercase tracking-widest text-white/90 [text-shadow:0_1px_3px_#000]">{small}</div>
                </div>
            </motion.div>
        </div>
    )
}

// The Valley of the End: a Rasengan and a Chidori fired close together meet between their two cards.
function Clash({ from, to }: { from: { x: number; y: number }; to: { x: number; y: number } }) {
    const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }
    return (
        <div className="absolute inset-0 pointer-events-none z-30" aria-hidden>
            <motion.div className="absolute w-14 h-14 -ml-7 -mt-7 rounded-full shadow-[0_0_36px_#38bdf8]" style={{ background: 'conic-gradient(#fff, #38bdf8, #1d4ed8, #fff, #38bdf8, #1d4ed8, #fff)' }} initial={{ left: from.x, top: from.y, scale: 0.6 }} animate={{ left: mid.x, top: mid.y, scale: 1.2, rotate: 1080 }} transition={{ duration: 0.55, ease: 'easeIn' }} />
            <motion.div className="absolute w-14 h-14 -ml-7 -mt-7 rounded-full shadow-[0_0_36px_#bfdbfe]" style={{ background: 'radial-gradient(circle, #fff 0%, #dbeafe 25%, #60a5fa 55%, #1e3a8a 100%)' }} initial={{ left: to.x, top: to.y, scale: 0.6 }} animate={{ left: mid.x, top: mid.y, scale: 1.2 }} transition={{ duration: 0.55, ease: 'easeIn' }} />
            {/* where they meet: the dark sphere, then the shockwave */}
            <motion.div className="absolute w-24 h-24 -ml-12 -mt-12 rounded-full" style={{ left: mid.x, top: mid.y, background: 'radial-gradient(circle, #0b1026 0%, #1e1b4b 55%, #e0f2fe 70%, transparent 72%)' }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.6, 2.4], opacity: [0, 1, 0] }} transition={{ delay: 0.5, duration: 1.1 }} />
            <motion.div className="absolute w-40 h-40 -ml-20 -mt-20 rounded-full border-4 border-white" style={{ left: mid.x, top: mid.y }} initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 3], opacity: [0, 0.9, 0] }} transition={{ delay: 0.6, duration: 0.8 }} />
            <motion.div className="absolute -translate-x-1/2 -translate-y-1/2 text-center whitespace-nowrap" style={{ left: mid.x, top: mid.y - 80 }} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: [0, 1, 1, 0], scale: [0.6, 1.1, 1, 1] }} transition={{ delay: 0.55, duration: 2.2, times: [0, 0.12, 0.8, 1] }}>
                <div className="text-2xl sm:text-4xl font-black italic text-white [-webkit-text-stroke:1.5px_#000] drop-shadow-[3px_3px_0_#000]">螺旋丸 vs 千鳥</div>
                <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-sky-100 [text-shadow:0_1px_3px_#000]">The Valley of the End</div>
            </motion.div>
        </div>
    )
}

/* ───────────── the cards ───────────── */

export default function JutsuCards() {
    const grid = useRef<HTMLDivElement>(null)
    const emblems = useRef<(HTMLButtonElement | null)[]>([])
    const live = useInView(grid, { margin: '10% 0px' })
    const later = useLater()
    const sageOn = useSage()
    const [fx, setFx] = useState<{ card: number; fx: Fx; id: number } | null>(null)
    const [step, setStep] = useState(0) // Rasengan training: 0 water balloon, 1 rubber ball, 2 forming it, 3 mastered
    const [holding, setHolding] = useState<number | null>(null)
    const [strain, setStrain] = useState(0) // 0..1 while a charged technique is held
    const [lifted, setLifted] = useState(false) // Kakashi's headband off the Sharingan
    const [bounce, setBounce] = useState(0) // bumps when Sakura's punch makes the skills jump
    const [clash, setClash] = useState<{ id: number; from: { x: number; y: number }; to: { x: number; y: number } } | null>(null)
    const fired = useRef({ rasengan: 0, chidori: 0 })
    const taps = useRef<number[]>([])
    const holdStart = useRef(0)
    // one handle per card, to shake or launch it
    const cardControls = [useAnimationControls(), useAnimationControls(), useAnimationControls(), useAnimationControls()]

    const show = (i: number, f: Fx) => { const id = Date.now(); setFx({ card: i, fx: f, id }); later(() => setFx((c) => (c?.id === id ? null : c)), 1800) }

    // A Rasengan and a Chidori within CLASH_MS of each other: the Valley of the End, between the two emblems.
    const fire = (kind: 'rasengan' | 'chidori') => {
        const now = Date.now()
        fired.current[kind] = now
        const other = kind === 'rasengan' ? fired.current.chidori : fired.current.rasengan
        if (now - other < CLASH_MS && grid.current) {
            const g = grid.current.getBoundingClientRect()
            const at = (i: number) => { const r = emblems.current[i]!.getBoundingClientRect(); return { x: r.left + r.width / 2 - g.left, y: r.top + r.height / 2 - g.top } }
            const id = now
            setClash({ id, from: at(0), to: at(1) })
            sfx.levelUp()
            later(() => setClash((c) => (c?.id === id ? null : c)), 2800)
        }
    }

    // Charged techniques: hold the emblem; it goes off when the charge is full, fizzles if you let go early.
    useEffect(() => {
        if (holding === null) return
        holdStart.current = performance.now()
        let raf = 0
        const chirp = holding === 1 ? setInterval(() => sfx.hover(), 70) : 0
        const tick = () => {
            const k = Math.min(1, (performance.now() - holdStart.current) / HOLD_MS)
            setStrain(k)
            if (k < 1) { raf = requestAnimationFrame(tick); return }
            // full: it goes off
            setHolding(null); setStrain(0)
            if (holding === 0) {
                if (step === 0) { setStep(1); show(0, 'pop'); sfx.pop() }
                else if (step === 1) { setStep(2); show(0, 'burst'); sfx.pop() }
                else { setStep(3); show(0, 'rasengan'); sfx.whoosh(); fire('rasengan') }
            } else { show(1, 'chidori'); sfx.whoosh(); fire('chidori'); cardControls[1].start({ x: [0, 18, -4, 0], transition: { duration: 0.45 } }) }
        }
        raf = requestAnimationFrame(tick)
        return () => { cancelAnimationFrame(raf); clearInterval(chirp) }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- the hold runs once per press; step is read when it completes
    }, [holding])

    const press = (i: number) => {
        const kind = CARDS[i].kind
        if (kind === 'rasengan' && step === 3) { show(0, 'rasengan'); sfx.whoosh(); fire('rasengan'); return }
        if (kind === 'rasengan' || kind === 'chidori') { setHolding(i); return }
        if (kind === 'kakashi') {
            const now = Date.now()
            taps.current = [...taps.current.filter((t) => now - t < 700), now]
            if (taps.current.length >= 3) {
                // three quick taps: the Thousand Years of Death, and the card goes flying
                taps.current = []
                show(2, 'poke'); sfx.pop()
                cardControls[2].start({ y: [0, -46, 0], rotate: [0, -5, 0], transition: { duration: 0.7, ease: 'easeOut' } })
                return
            }
            const up = !lifted
            setLifted(up)
            sfx.click()
            if (up) {
                // the Sharingan really copies: the whole skill list goes to the clipboard
                const text = resume.skills.map((g) => `${g.group}: ${g.items.join(', ')}`).join('\n')
                navigator.clipboard?.writeText(text).then(() => show(2, 'copy'), () => {})
            }
            return
        }
        // Sakura
        show(3, 'shannaroo'); sfx.pop(); setBounce((b) => b + 1)
        cardControls[3].start({ x: [0, -10, 10, -7, 7, -3, 0], y: [0, 4, -2, 0], transition: { duration: 0.5 } })
    }
    const release = (i: number) => {
        if (holding !== i) return
        const k = (performance.now() - holdStart.current) / HOLD_MS
        setHolding(null); setStrain(0)
        if (k < 1) show(i, 'fizzle')
    }

    const hint = (kind: Kind) => kind === 'rasengan'
        ? (['Step 1 of 3 · hold to burst the water balloon', 'Step 2 of 3 · hold to burst the rubber ball', 'Step 3 of 3 · hold to form the Rasengan', 'Mastered · tap to throw it, or fire it with a Chidori'][step])
        : kind === 'chidori' ? 'Hold to charge · fire it right after a Rasengan'
            : kind === 'kakashi' ? (lifted ? 'Sharingan out · tap to cover it · three quick taps…' : 'Tap to lift the forehead protector · three quick taps…')
                : 'Tap the blossom'

    return (
        <div ref={grid} className="relative grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
            {resume.skills.map((group, i) => {
                const c = CARDS[i]
                if (!c) return null
                const charging = holding === i
                const name = c.kind === 'rasengan' && sageOn && step === 3 ? 'Rasenshuriken' : c.name
                return (
                    <motion.div key={group.group} animate={cardControls[i]} className="relative rounded-2xl border bg-black/60 p-4 sm:p-5" style={{ borderColor: `${c.tint}40`, boxShadow: charging ? `0 0 ${12 + strain * 30}px ${c.tint}` : undefined }}>
                        <div className="flex items-start gap-4">
                            <button
                                ref={(el) => { emblems.current[i] = el }}
                                type="button"
                                onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); press(i) }}
                                onPointerUp={() => release(i)}
                                onPointerCancel={() => release(i)}
                                onMouseDown={(e) => e.preventDefault()}
                                onKeyDown={(e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); press(i) } }}
                                onKeyUp={(e) => { if (e.key === ' ' || e.key === 'Enter') release(i) }}
                                onContextMenu={(e) => e.preventDefault()}
                                aria-label={`${name}: ${hint(c.kind)}`}
                                className="relative shrink-0 w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] rounded-full outline-none touch-none select-none transition-transform hover:scale-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-white/70"
                            >
                                {/* the charge, as a ring filling round the emblem */}
                                {charging && (
                                    <svg viewBox="0 0 100 100" className="absolute -inset-2 w-[calc(100%+1rem)] h-[calc(100%+1rem)] -rotate-90" aria-hidden>
                                        <circle cx={50} cy={50} r={47} fill="none" stroke={c.tint} strokeWidth={4} pathLength={1} strokeDasharray={`${strain} 1`} strokeLinecap="round" />
                                    </svg>
                                )}
                                <motion.span
                                    className="block w-full h-full"
                                    animate={charging && c.kind === 'rasengan' && step < 2
                                        ? { rotate: [0, -10, 9, -12, 10, 0], scaleX: [1, 1 + strain * 0.25, 1 - strain * 0.15, 1 + strain * 0.3, 1], scaleY: [1, 1 - strain * 0.2, 1 + strain * 0.2, 1 - strain * 0.25, 1] }
                                        : charging ? { scale: [1, 1.06, 1] } : { rotate: 0, scale: 1, scaleX: 1, scaleY: 1 }}
                                    transition={charging ? { duration: 0.3, repeat: Infinity } : { duration: 0.2 }}
                                >
                                    {c.kind === 'rasengan' && (step === 0 ? <Balloon strain={charging ? strain : 0} /> : step === 1 ? <RubberBall strain={charging ? strain : 0} /> : <span className="block w-full h-full" style={{ transform: step === 2 ? `scale(${0.35 + (charging ? strain : 0) * 0.65})` : undefined }}><RasenganOrb live={live} awake={sageOn && step === 3} /></span>)}
                                    {c.kind === 'chidori' && <ChidoriOrb live={live} charge={charging} />}
                                    {c.kind === 'kakashi' && (
                                        <span className="relative block w-full h-full">
                                            <SharinganEye live={live} awake={lifted} />
                                            <motion.span className="absolute -inset-1" initial={false} animate={{ y: lifted ? '-62%' : '0%', rotate: lifted ? -6 : 0 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}><Headband /></motion.span>
                                        </span>
                                    )}
                                    {c.kind === 'sakura' && <Blossom live={live} />}
                                </motion.span>
                            </button>
                            <div className="min-w-0">
                                <div className="text-xl sm:text-2xl font-black leading-tight text-white">{group.group}</div>
                                <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-[11px] font-bold uppercase tracking-widest">
                                    <span style={{ color: c.tint }}>{name}</span>
                                    <span className="font-black text-white/70">{c.kanji}</span>
                                    <span className="text-white/70">· {c.owner}</span>
                                </div>
                                <p className="mt-1.5 text-sm leading-snug text-white/75">{c.why}</p>
                                <p className="mt-1 text-[11px] font-mono uppercase tracking-wider" style={{ color: c.tint }}>{hint(c.kind)}</p>
                            </div>
                        </div>
                        <div className="relative mt-4 flex flex-wrap gap-2">
                            {group.items.map((skill, s) => (
                                <motion.span
                                    // Sakura's punch makes her skills jump; re-keyed so they land again
                                    key={`${skill}${c.kind === 'sakura' ? bounce : 0}`}
                                    initial={c.kind === 'sakura' && bounce ? { y: -26 - (s % 3) * 10, rotate: (s % 2 ? 1 : -1) * 12 } : { opacity: 0, scale: 0.8 }}
                                    animate={c.kind === 'sakura' && bounce ? { y: 0, rotate: 0 } : undefined}
                                    whileInView={c.kind === 'sakura' && bounce ? undefined : { opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={c.kind === 'sakura' && bounce ? { type: 'spring', stiffness: 380, damping: 9, delay: s * 0.03 } : { delay: s * 0.04 }}
                                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm font-medium text-white/75 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors cursor-default"
                                >
                                    {skill}
                                </motion.span>
                            ))}
                        </div>
                        <AnimatePresence>{fx?.card === i && <CardFx key={fx.id} fx={fx.fx} seed={fx.id} sage={sageOn} />}</AnimatePresence>
                    </motion.div>
                )
            })}
            {clash && <Clash key={clash.id} from={clash.from} to={clash.to} />}
        </div>
    )
}
