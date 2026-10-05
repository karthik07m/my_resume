'use client'

import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'

// Goku's forms in the order he reached them.
// `ki`/`ki2` recolour the hero and its rising embers, `aura` is the flame behind the name.
export const SAIYAN = [
    { name: 'Base', note: '', ki: '#22c55e', ki2: '#14b8a6', aura: '#a5f3fc' },
    { name: 'Super Saiyan', note: 'The legend is real · power ×50', ki: '#facc15', ki2: '#f97316', aura: '#fde047' },
    { name: 'Super Saiyan 2', note: 'Lightning in the aura · power ×100', ki: '#fde047', ki2: '#f59e0b', aura: '#fef08a' },
    { name: 'Super Saiyan 3', note: 'Power ×400 · burns through energy fast', ki: '#fbbf24', ki2: '#ea580c', aura: '#fcd34d' },
    { name: 'Super Saiyan God', note: 'Godly ki · mortals cannot sense it', ki: '#f43f5e', ki2: '#fb923c', aura: '#fb7185' },
    { name: 'Super Saiyan Blue', note: 'God ki with Super Saiyan on top', ki: '#38bdf8', ki2: '#3b82f6', aura: '#7dd3fc' },
    { name: 'Ultra Instinct', note: 'The body moves on its own', ki: '#e2e8f0', ki2: '#a5b4fc', aura: '#e0e7ff' },
]

const HOLD_MS = 1600
const INTRO_KEY = 'ssj-intro-seen'

// Goku's canon readings: 416 against Raditz, 3,000,000 on Namek, 150,000,000 as a Super Saiyan.
// Nothing past that was ever measured, so from Super Saiyan 2 on the scouter is simply blown.
const reading = (level: number, charge: number) =>
    level === 0 ? 416 * (3e6 / 416) ** charge : level === 1 ? 15e7 * 2 ** charge : null

interface Props {
    level: number
    onCharge: (charge: number) => void
    onAscend: () => void
    onPowerDown: () => void
    onSkipIntro: () => void
}

// Hold it to charge ki; a full gauge moves the hero up one form in SAIYAN.
export default function Scouter({ level, onCharge, onAscend, onPowerDown, onSkipIntro }: Props) {
    const [holding, setHolding] = useState(false)
    const [charge, setCharge] = useState(0)
    const live = useRef(0) // same value as `charge`, readable inside the frame loop
    const max = level === SAIYAN.length - 1

    // One loop for both directions: the gauge fills while held and drains twice as fast once let go.
    useEffect(() => {
        if (!holding && live.current === 0) return
        let last = performance.now()
        let id = requestAnimationFrame(function step(now) {
            const dt = (now - last) / HOLD_MS
            last = now
            const c = Math.min(1, Math.max(0, live.current + (holding ? dt : -2 * dt)))
            const full = c === 1
            live.current = full ? 0 : c
            setCharge(live.current)
            onCharge(live.current)
            // A full gauge needs a fresh press for the next form, so each transformation is deliberate.
            if (full) { setHolding(false); onAscend() }
            else if (c > 0 || holding) id = requestAnimationFrame(step)
        })
        return () => cancelAnimationFrame(id)
    }, [holding, onAscend, onCharge])

    // The opening: once the splash has cleared, the hero powers itself up to Super Saiyan, so a transformation is the
    // first thing a visitor sees. Once per visitor: on later visits the hero simply starts transformed (onSkipIntro).
    // Not for reduced motion, and not if they have already scrolled past the hero.
    useEffect(() => {
        let seen = false
        try { seen = localStorage.getItem(INTRO_KEY) === '1' } catch { /* storage blocked: treat as a first visit */ }
        if (seen) {
            const skip = setTimeout(onSkipIntro, 0)
            return () => clearTimeout(skip)
        }
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
        const timer = setTimeout(() => {
            if (scrollY >= innerHeight / 2) return
            try { localStorage.setItem(INTRO_KEY, '1') } catch { /* storage blocked: it will just play again next time */ }
            setHolding(true)
        }, Math.max(500, 2200 - performance.now()))
        return () => clearTimeout(timer)
    }, [onSkipIntro])

    const press = () => { if (!max) setHolding(true) }
    const release = () => setHolding(false)

    const value = reading(level, charge)
    const hint = max ? 'Final form reached'
        : level === 0 && value !== null && value > 9000 ? "It's over 9000!"
        : charge > 0 ? 'Powering up…'
        : 'Hold to power up'

    return (
        <div className="flex flex-col items-start gap-1">
            <button
                type="button"
                onPointerDown={(e) => { press(); e.currentTarget.setPointerCapture(e.pointerId) }}
                onPointerUp={release}
                onPointerCancel={release}
                onKeyDown={(e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) press() }}
                onKeyUp={release}
                onBlur={release}
                onContextMenu={(e) => e.preventDefault()}
                aria-label={max ? `${SAIYAN[level].name}: final form reached` : `Hold to power up. Current form: ${SAIYAN[level].name}`}
                title={max ? undefined : 'Hold to power up (Space works too)'}
                className={clsx(
                    'relative w-48 overflow-hidden rounded-md border border-lime-400/40 bg-lime-400/[0.07] px-3 py-2 text-left font-mono select-none touch-none [-webkit-touch-callout:none] transition-colors',
                    max ? 'cursor-default' : 'cursor-pointer hover:bg-lime-400/[0.14]',
                )}
            >
                <div className={clsx('text-[10px] uppercase tracking-[0.2em] whitespace-nowrap', level ? 'text-(--ki)' : 'text-lime-300/70')}>
                    ◎ {level ? SAIYAN[level].name : 'Scouter'}
                </div>
                <div className={clsx('text-xl font-black tabular-nums leading-tight', value === null ? 'text-red-400' : 'text-yellow-200')}>
                    {value === null ? 'OVERLOAD' : Math.round(value).toLocaleString('en-US')}
                </div>
                {/* Ki gauge */}
                <div className="mt-1 h-1 bg-white/10" aria-hidden>
                    <div className="h-full origin-left bg-(--ki)" style={{ transform: `scaleX(${charge})` }} />
                </div>
                <div className={clsx('mt-1 text-[10px] uppercase tracking-[0.2em] text-lime-200', charge === 0 && !max && 'animate-pulse')}>{hint}</div>
                {/* Past Super Saiyan the lens cracks */}
                {value === null && (
                    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
                        <path d="M100,4 L78,13 L84,19 L61,24 L67,31 L44,40 M84,19 L96,27 M61,24 L52,15" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                    </svg>
                )}
            </button>
            {level > 0 && (
                <button type="button" onClick={onPowerDown} className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/65 hover:text-white transition-colors">
                    ↓ Power down
                </button>
            )}
        </div>
    )
}
