'use client'

import Section from '@/components/ui/Section'
import resume from '@/data/resume.json'
import { motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import { sage, useSage } from '@/components/ui/SageMode'
import JutsuCards, { SharinganEye } from './Jutsu'
import BellTest from './BellTest'
import { KanjiWatermark, MangaSfx } from '@/components/ui/MangaText'

const skillCount = resume.skills.reduce((n, g) => n + g.items.length, 0)

// The marks a shinobi carries, drawn in the current text colour.
type Mark = (p: { className?: string }) => React.ReactElement
const Kunai: Mark = ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
        <path d="M12 1 L16.5 9.5 L12 14 L7.5 9.5 Z" />
        <rect x="11" y="13.5" width="2" height="5" opacity="0.7" />
        <circle cx="12" cy="20.6" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
)
const Shuriken: Mark = ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" fillRule="evenodd" aria-hidden>
        <path d="M12 1 L14.6 9.4 L23 12 L14.6 14.6 L12 23 L9.4 14.6 L1 12 L9.4 9.4 Z M12 10 a2 2 0 1 0 0.01 0 Z" />
    </svg>
)
const Scroll: Mark = ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
        <rect x="6" y="7" width="12" height="10" opacity="0.35" />
        <rect x="2.5" y="5" width="4.5" height="14" rx="2.2" />
        <rect x="17" y="5" width="4.5" height="14" rx="2.2" />
        <path d="M9 10.5 h6 M9 13.5 h4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
)
// The Hidden Leaf: a spiral that runs out into a pointed tip.
const Leaf: Mark = ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M 13 12 a 1.6 1.6 0 0 1 3.2 0 a 3.4 3.4 0 0 1 -6.8 0 a 5.2 5.2 0 0 1 10.4 0 a 7 7 0 0 1 -12 4.9" />
        <path d="M 7.8 16.9 L 2 20 L 4.2 13.2 Z" fill="currentColor" />
    </svg>
)

const stats: { label: string; value: string; Icon: Mark }[] = [
    { label: 'Appian Experience', value: '7+ Years', Icon: Kunai },
    { label: 'Level', value: 'Senior', Icon: Leaf },
    { label: 'Certification', value: 'Appian L2', Icon: Scroll },
    { label: 'Tech Stack', value: `${skillCount}+`, Icon: Shuriken },
]

// How far an iris can travel from the centre of its eye, in px. Eyes are wider than they are tall.
const REACH = { x: 9, y: 4 }
const SETTLE_MS = 60 // how quickly the gaze closes on its target: quick like a glance, not a slow glide
const IDLE_MS = 2500 // with nothing moving for this long, the eyes come back to look at you

// A pair of Sharingan that watch the pointer, built to move the way eyes do:
// - they look together. One gaze, taken from the middle of the pair, drives both irises, so they never cross.
// - the gaze spans the screen. The iris reaches the corner of the eye only when the pointer reaches the edge of the
//   window, so where the eyes point always matches where the pointer is.
// - a glance is quick and then still. The gaze closes most of the gap within a few frames and stops.
// - an eye is a ball. The iris narrows as it turns away, the glint on its surface lags behind it, and the upper
//   lid follows the gaze down.
// - attention follows movement. When the pointer has been still for a while, or has left, they look back at you.
// Bring the pointer right up to them and they awaken into the Mangekyō. They blink. Nothing runs off screen.
function SharinganEyes() {
    const box = useRef<HTMLDivElement>(null)
    const watching = useInView(box)
    const [awake, setAwake] = useState(false)

    useEffect(() => {
        const el = box.current
        if (!el || !watching) return
        const eyes = [...el.querySelectorAll<HTMLElement>('[data-eye]')]
        const gaze = { x: 0, y: 0, tx: 0, ty: 0 } // where the pair is looking and where it is heading, each -1..1
        let frame = 0, last = 0, idle = 0, near = false

        const draw = (now: number) => {
            const k = 1 - Math.exp(-Math.min(50, now - last) / SETTLE_MS)
            last = now
            gaze.x += (gaze.tx - gaze.x) * k
            gaze.y += (gaze.ty - gaze.y) * k
            const settled = Math.abs(gaze.tx - gaze.x) + Math.abs(gaze.ty - gaze.y) < 0.004
            if (settled) { gaze.x = gaze.tx; gaze.y = gaze.ty }
            for (const eye of eyes) {
                eye.style.setProperty('--gx', `${(gaze.x * REACH.x).toFixed(2)}px`)
                eye.style.setProperty('--gy', `${(gaze.y * REACH.y).toFixed(2)}px`)
                // turned away, a round iris is seen at an angle
                eye.style.setProperty('--sx', (1 - 0.14 * Math.abs(gaze.x)).toFixed(3))
                eye.style.setProperty('--sy', (1 - 0.1 * Math.abs(gaze.y)).toFixed(3))
            }
            frame = settled ? 0 : requestAnimationFrame(draw)
        }
        const lookAt = (at: { x: number; y: number } | null) => {
            if (!at) {
                gaze.tx = 0; gaze.ty = 0
            } else {
                const pair = el.getBoundingClientRect()
                const cx = pair.left + pair.width / 2, cy = pair.top + pair.height / 2
                const dx = at.x - cx, dy = at.y - cy
                // 1 at the edge of the window in that direction, 0 on the eyes themselves
                let nx = dx / Math.max(1, dx > 0 ? innerWidth - cx : cx)
                let ny = dy / Math.max(1, dy > 0 ? innerHeight - cy : cy)
                // a little more turn for a pointer that is close, so the eyes are never sluggish
                nx = Math.sign(nx) * Math.min(1, Math.abs(nx)) ** 0.75
                ny = Math.sign(ny) * Math.min(1, Math.abs(ny)) ** 0.75
                const over = Math.hypot(nx, ny)
                gaze.tx = over > 1 ? nx / over : nx
                gaze.ty = over > 1 ? ny / over : ny
                // awakens when the pointer is close, and holds until it has clearly gone, so it never flickers at the line
                const far = Math.hypot(dx, dy)
                if (far < 90) near = true
                else if (far > 140) near = false
            }
            if (!at) near = false
            setAwake(near)
            if (!frame) { last = performance.now(); frame = requestAnimationFrame(draw) }
        }
        const onMove = (e: PointerEvent) => {
            lookAt({ x: e.clientX, y: e.clientY })
            clearTimeout(idle)
            idle = window.setTimeout(() => lookAt(null), IDLE_MS)
        }
        const onLeave = () => { clearTimeout(idle); lookAt(null) }
        window.addEventListener('pointermove', onMove, { passive: true })
        document.documentElement.addEventListener('pointerleave', onLeave)
        return () => {
            window.removeEventListener('pointermove', onMove)
            document.documentElement.removeEventListener('pointerleave', onLeave)
            clearTimeout(idle)
            cancelAnimationFrame(frame)
        }
    }, [watching])

    return (
        <div ref={box} className="inline-flex gap-1.5" title="Sharingan" aria-hidden>
            {['left', 'right'].map((side) => (
                <div key={side} data-eye className="relative w-12 h-7 rounded-[50%] bg-zinc-100 overflow-hidden shadow-[inset_0_-2px_3px_rgba(0,0,0,0.18)]">
                    <div className="absolute left-1/2 top-1/2 w-[22px] h-[22px] -ml-[11px] -mt-[11px] will-change-transform [transform:translate(var(--gx,0px),var(--gy,0px))_scale(var(--sx,1),var(--sy,1))]">
                        <SharinganEye live={watching} awake={awake} glow={false} />
                        {/* the glint is a reflection on the surface, so it lags behind the iris as the eye turns under it */}
                        <div className="absolute left-[24%] top-[16%] w-[24%] h-[24%] rounded-full bg-white/85 [transform:translate(calc(var(--gx,0px)*-0.35),calc(var(--gy,0px)*-0.35))]" />
                    </div>
                    {/* the shadow of the upper lid, which comes down with the gaze */}
                    <div className="absolute inset-x-0 -top-1 h-[62%] bg-gradient-to-b from-black/60 via-black/15 to-transparent [transform:translateY(calc(var(--gy,0px)*0.7))]" />
                    {/* the lid: drops shut for an instant every few seconds */}
                    <div className={clsx('absolute inset-0 origin-top [transform:scaleY(0)] bg-[#1c1206]', watching && 'motion-safe:animate-[blink-lid_5.5s_ease-in-out_infinite]')} style={{ animationDelay: '1.5s' }} />
                </div>
            ))}
        </div>
    )
}

// Naruto's Sage Mode, as a switch: the toad's eye with its bar pupil and the orange around it. It is the same Sage
// Mode as the frog button in the corner, so the whole site goes with it.
function SageSwitch() {
    const on = useSage()
    return (
        <button
            type="button"
            onClick={() => sage.toggle()}
            aria-pressed={on}
            className={clsx('flex items-center gap-3 rounded-full border pl-2 pr-5 py-2 text-left transition-colors', on ? 'border-orange-400 bg-orange-500/20' : 'border-white/15 bg-black/50 hover:border-orange-400/70 hover:bg-orange-500/10')}
        >
            <svg viewBox="0 0 60 40" className="w-14 shrink-0" aria-hidden>
                <path d="M 1 20 Q 30 -8 59 20 Q 30 48 1 20 Z" fill="#f97316" />
                <path d="M 8 20 Q 30 2 52 20 Q 30 38 8 20 Z" fill="#fefce8" stroke="#7c2d12" strokeWidth="1" />
                <circle cx="30" cy="20" r="11.5" fill="#facc15" stroke="#a16207" strokeWidth="1" />
                <rect x="20" y="17.4" width="20" height="5.2" rx="2.2" fill="#111827" />
            </svg>
            <span>
                <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">Naruto&apos;s power-up</span>
                <span className="block text-sm font-black text-white">{on ? 'Release Sage Mode' : 'Enter Sage Mode'}</span>
            </span>
        </button>
    )
}

const rise = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } }

export default function About() {
    const sageOn = useSage()
    return (
        // Sage Mode is orange and gold, which this section already is: it keeps its colours and warms up.
        <Section id="about" className="relative py-12 md:py-20">
            <div className={clsx('pointer-events-none absolute inset-0 transition-opacity duration-700 bg-[radial-gradient(70%_45%_at_25%_8%,rgba(251,146,60,0.28),transparent_70%),radial-gradient(60%_40%_at_85%_60%,rgba(250,204,21,0.14),transparent_70%)]', sageOn ? 'opacity-100' : 'opacity-0')} aria-hidden />
            {/* Title on the left; Kakashi's bell test and the Sage Mode switch on the right */}
            <motion.div {...rise} className="relative z-20 flex flex-wrap items-end justify-between gap-6 mb-8 md:mb-10">
                <div className="relative isolate">
                    {/* 忍: shinobi */}
                    <KanjiWatermark text="忍" color="#fb923c" className="-left-3 md:-left-12 -top-6" />
                    <div className="inline-flex items-center gap-3 px-3 py-2 mb-4 rounded-full bg-orange-500/10 border border-orange-500/20">
                        <SharinganEyes />
                        <span className="text-sm font-bold tracking-[0.2em] uppercase text-orange-500">Hidden Leaf · Team 7</span>
                    </div>
                    {/* fits the heading, so the sticker beside it sits just past the title, not out by the buttons */}
                    <div className="relative mb-4 md:w-fit">
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 [filter:drop-shadow(0_2px_6px_rgba(0,0,0,0.95))]">
                            THE CODE I LIVE BY
                        </h2>
                        {/* Naruto's verbal tic, which the English dub turned into "Believe it!" */}
                        <MangaSfx jp="だってばよ!" en="Believe it!" color="#fdba74" tilt={-6} className="mt-3 md:mt-0 md:absolute md:left-full md:ml-4 md:-top-4" />
                    </div>
                    <div className="h-1 w-32 bg-orange-500 rounded-full mb-3" />
                    {/* what Naruto calls the code he lives by */}
                    <p className="font-mono text-xs uppercase tracking-[0.3em] text-orange-300">忍道 · Nindō, my ninja way</p>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-3">
                    <BellTest />
                    <SageSwitch />
                </div>
            </motion.div>

            {/* The bio beside the numbers and the training, top-aligned so neither column floats in empty space */}
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
                <div className="lg:col-span-7 relative">
                    <motion.div {...rise} className="bg-black/80 border border-orange-500/30 p-5 sm:p-8 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                        <h3 className="text-2xl font-bold mb-5 flex items-center gap-3 text-white">
                            <Scroll className="w-8 h-8 text-orange-400" /> Mission Report
                        </h3>
                        {/* the classification stamped on a mission scroll: S is the highest there is */}
                        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 rotate-6 rounded border-2 border-orange-400/70 px-2 py-1 text-center text-orange-300" title="Mission rank: S">
                            <div className="font-mono text-[8px] uppercase tracking-[0.25em]">Rank</div>
                            <div className="text-2xl font-black leading-none">S</div>
                        </div>
                        <div className="space-y-4 text-base sm:text-lg text-white/80 leading-relaxed">
                            {resume.about.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                            ))}
                        </div>
                    </motion.div>
                </div>

                <div className="lg:col-span-5 space-y-5 lg:space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        {stats.map((stat, index) => (
                            <motion.div key={stat.label} {...rise} transition={{ delay: index * 0.06 }} className="bg-black/60 border border-white/10 p-4 rounded-xl">
                                <stat.Icon className="w-7 h-7 mb-2 text-orange-400" />
                                <div className="text-xl sm:text-2xl font-bold text-white font-mono">{stat.value}</div>
                                <div className="text-xs font-bold uppercase tracking-wider text-white/50">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                    {/* Training Arc (Education) */}
                    <motion.div {...rise} className="bg-black/60 border border-white/10 p-4 sm:p-5 rounded-xl">
                        <h3 className="text-lg font-bold mb-3 text-orange-400 flex items-center gap-2">
                            <Leaf className="w-5 h-5" /> Training Arc
                        </h3>
                        <ul className="space-y-2 text-sm text-white/70">
                            {resume.education.map((edu) => (
                                <li key={edu.degree} className="flex flex-col sm:flex-row sm:gap-3">
                                    <span className="font-mono text-white/60 shrink-0">{edu.period}</span>
                                    <span>{edu.degree}, {edu.school}{edu.note && <span className="text-white/60"> · {edu.note}</span>}</span>
                                </li>
                            ))}
                            {resume.certifications.map((cert) => (
                                <li key={cert} className="flex flex-col sm:flex-row sm:gap-3">
                                    <span className="font-mono text-orange-300 shrink-0">Certified</span>
                                    <span>{cert}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>

            {/* Skills: one technique per group, across the full width */}
            <motion.div {...rise} className="relative z-10 mt-10 md:mt-12">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-5">
                    <h3 className="text-xl font-bold text-orange-400 flex items-center gap-2">
                        <Shuriken className="w-5 h-5" /> Skills & Superpowers
                    </h3>
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">Four Team 7 moments · hold or tap each emblem</p>
                </div>
                <JutsuCards />
            </motion.div>
        </Section>
    )
}
