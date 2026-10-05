'use client'

import { motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { clsx } from 'clsx'
import resume from '@/data/resume.json'
import { sfx } from '@/lib/sfx'
import { makeRand } from './BossFight'
import { KanjiWatermark, MangaSfx } from '@/components/ui/MangaText'

// Solo Leveling: every shipped project is a shadow extracted into the army, in resume.json order.
const SHADOWS = [
    { name: 'Igris', lore: 'The first knight to kneel. Still on duty years later.' },
    { name: 'Beru', lore: 'The Ant King: evolved fast by feeding on everything it met.' },
    { name: 'Iron', lore: 'The shield bearer. Nothing gets past it, data included.' },
    { name: 'Kaisel', lore: 'The flying mount, always hovering at your side, like DOT.' },
]

const PANEL = 'rounded-md border border-sky-400/70 bg-[linear-gradient(180deg,rgba(8,47,73,0.88),rgba(2,6,23,0.94))] shadow-[0_0_28px_rgba(56,189,248,0.35),inset_0_0_28px_rgba(56,189,248,0.12)]'
const GLOW = '[text-shadow:0_0_10px_rgba(56,189,248,0.9)]'
const SHADE = '#0b0614' // shadow-soldier black, rimmed in violet
const RIM = '#7c3aed'

function TitleBar({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative flex items-center gap-2.5 px-4 py-2 border-b border-sky-400/40 bg-sky-400/5">
            <span className="grid place-items-center w-5 h-5 rounded-[4px] border border-sky-300 text-sky-100 text-[11px] font-black shadow-[0_0_10px_rgba(56,189,248,0.8)]">!</span>
            <span className={clsx('text-[11px] font-bold uppercase tracking-[0.35em] text-sky-100', GLOW)}>{children}</span>
        </div>
    )
}

// Scanlines over every panel, like the System's hologram.
const Scanlines = () => <div aria-hidden className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(125,211,252,0.05)_0_1px,transparent_1px_3px)]" />

/* ── The shadows, drawn standing with feet at (0, 0), about 110 units tall. Eyes are separate so they can ignite. ── */

function Igris() {
    return (
        <g>
            <path d="M -20 -78 L -30 -6 L 30 -6 L 20 -78 Z" fill="#1a0b2e" />
            <path d="M -14 0 L -10 -40 L -2 -40 L -4 0 Z M 4 0 L 2 -40 L 10 -40 L 14 0 Z" fill={SHADE} />
            <path d="M -18 -40 L -22 -78 L 22 -78 L 18 -40 Z" fill={SHADE} stroke={RIM} strokeWidth={1} />
            <ellipse cx={-22} cy={-76} rx={9} ry={6} fill={SHADE} stroke={RIM} strokeWidth={1} />
            <ellipse cx={22} cy={-76} rx={9} ry={6} fill={SHADE} stroke={RIM} strokeWidth={1} />
            <path d="M -9 -80 L -10 -98 Q 0 -106 10 -98 L 9 -80 Z" fill={SHADE} stroke={RIM} strokeWidth={1} />
            {/* the red plume */}
            <path d="M 0 -103 Q 16 -118 30 -104 Q 16 -109 2 -99 Z" fill="#b91c1c" />
            {/* sword planted in the ground */}
            <rect x={28} y={-72} width={4} height={72} fill="#1e1b4b" stroke={RIM} strokeWidth={0.8} />
            <rect x={22} y={-74} width={16} height={4} fill={SHADE} stroke={RIM} strokeWidth={0.8} />
            <path d="M 22 -64 L 28 -70" stroke={SHADE} strokeWidth={6} strokeLinecap="round" />
        </g>
    )
}

function Beru() {
    return (
        <g>
            <ellipse cx={-20} cy={-82} rx={8} ry={28} transform="rotate(-28 -20 -82)" fill="#4c1d95" opacity={0.55} />
            <ellipse cx={20} cy={-82} rx={8} ry={28} transform="rotate(28 20 -82)" fill="#4c1d95" opacity={0.55} />
            <path d="M -10 0 L -6 -38 M 10 0 L 6 -38" stroke={SHADE} strokeWidth={6} strokeLinecap="round" />
            <ellipse cx={0} cy={-50} rx={12} ry={15} fill={SHADE} stroke={RIM} strokeWidth={1} />
            <ellipse cx={0} cy={-74} rx={15} ry={12} fill={SHADE} stroke={RIM} strokeWidth={1} />
            <path d="M -13 -72 L -30 -56 L -38 -64 M -30 -56 L -36 -52 M 13 -72 L 30 -56 L 38 -64 M 30 -56 L 36 -52" fill="none" stroke={SHADE} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
            <ellipse cx={0} cy={-94} rx={10} ry={9} fill={SHADE} stroke={RIM} strokeWidth={1} />
            <path d="M -6 -88 L -11 -80 M 6 -88 L 11 -80" stroke={SHADE} strokeWidth={3} strokeLinecap="round" />
            <path d="M -4 -102 Q -14 -120 -24 -115 M 4 -102 Q 14 -120 24 -115" fill="none" stroke={SHADE} strokeWidth={2} />
        </g>
    )
}

// Iron: the hulking tank. Head sunk between spiked pauldrons, horned helm, a kite shield up front and a great axe.
function Iron() {
    return (
        <g>
            {/* great axe, behind him: the haft, then a crescent blade and a back spike */}
            <path d="M 40 -112 V -2" stroke={SHADE} strokeWidth={4} strokeLinecap="round" />
            <path d="M 40 -106 Q 64 -114 62 -84 Q 54 -94 40 -90 Z" fill={SHADE} stroke={RIM} strokeWidth={1} />
            <path d="M 40 -102 L 28 -98 L 40 -94 Z" fill={SHADE} stroke={RIM} strokeWidth={0.8} />
            {/* armoured legs with knee plates */}
            <path d="M -22 0 L -18 -36 L -5 -36 L -7 0 Z M 7 0 L 5 -36 L 18 -36 L 22 0 Z" fill={SHADE} />
            <ellipse cx={-12} cy={-22} rx={7} ry={5} fill={SHADE} stroke={RIM} strokeWidth={0.8} />
            <ellipse cx={12} cy={-22} rx={7} ry={5} fill={SHADE} stroke={RIM} strokeWidth={0.8} />
            {/* barrel chest tapering to the waist, then the tassets */}
            <path d="M -32 -86 Q -36 -58 -18 -40 L 18 -40 Q 36 -58 32 -86 Z" fill={SHADE} stroke={RIM} strokeWidth={1} />
            <path d="M -20 -42 L -24 -30 L -6 -30 L -4 -42 M 4 -42 L 6 -30 L 24 -30 L 20 -42" fill={SHADE} stroke={RIM} strokeWidth={0.8} />
            {/* the axe arm and gauntlet */}
            <path d="M 30 -80 Q 40 -70 40 -58" stroke={SHADE} strokeWidth={9} strokeLinecap="round" fill="none" />
            <circle cx={40} cy={-56} r={5} fill={SHADE} stroke={RIM} strokeWidth={0.8} />
            {/* spiked pauldrons */}
            <path d="M -48 -78 Q -46 -98 -22 -94 L -20 -80 Q -34 -72 -48 -78 Z M 48 -78 Q 46 -98 22 -94 L 20 -80 Q 34 -72 48 -78 Z" fill={SHADE} stroke={RIM} strokeWidth={1} />
            <path d="M -40 -92 L -46 -106 L -34 -95 M 40 -92 L 46 -106 L 34 -95" fill={SHADE} stroke={RIM} strokeWidth={0.8} />
            {/* horned helm, sunk low, with the visor slit the eyes burn through */}
            <path d="M -10 -102 Q -24 -106 -22 -122 M 10 -102 Q 24 -106 22 -122" fill="none" stroke={SHADE} strokeWidth={3.5} strokeLinecap="round" />
            <path d="M -11 -84 L -12 -100 Q 0 -110 12 -100 L 11 -84 Q 0 -80 -11 -84 Z" fill={SHADE} stroke={RIM} strokeWidth={1} />
            <path d="M -9 -95 H 9" stroke="#1e1b4b" strokeWidth={3} />
            {/* kite shield up front */}
            <path d="M -62 -86 H -26 V -54 Q -26 -28 -44 -14 Q -62 -28 -62 -54 Z" fill="#120a24" stroke={RIM} strokeWidth={1.4} />
            <path d="M -44 -80 V -24 M -56 -62 H -32" stroke={RIM} strokeWidth={1} opacity={0.6} />
        </g>
    )
}

function Kaisel() {
    return (
        <g>
            <path d="M -22 -70 Q -42 -64 -56 -76" fill="none" stroke={SHADE} strokeWidth={4} strokeLinecap="round" />
            <ellipse cx={0} cy={-70} rx={24} ry={9} fill={SHADE} stroke={RIM} strokeWidth={1} />
            <path d="M 18 -72 Q 32 -86 42 -90" fill="none" stroke={SHADE} strokeWidth={7} strokeLinecap="round" />
            <path d="M 38 -94 L 56 -90 L 40 -84 Z" fill={SHADE} stroke={RIM} strokeWidth={0.8} />
            <path d="M 40 -94 L 34 -102" stroke={SHADE} strokeWidth={2} />
            {/* wings beat */}
            <motion.g animate={{ scaleY: [1, 0.35, 1] }} transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }} style={{ originX: 0.5, originY: 1 }}>
                <path d="M -6 -74 L -34 -120 L -14 -104 L 2 -126 L 10 -76 Z" fill={SHADE} stroke={RIM} strokeWidth={1} />
            </motion.g>
        </g>
    )
}

// Each shadow: its art, where it stands on the stage, where its eyes are, and how high it hovers (Kaisel flies).
const ARMY = [
    { Art: Igris, x: 150, eyes: [[-4, -90], [4, -90]], fly: 0 },
    { Art: Beru, x: 320, eyes: [[-4, -95], [4, -95]], fly: 0 },
    { Art: Iron, x: 490, eyes: [[-4.5, -95], [4.5, -95]], fly: 0 },
    { Art: Kaisel, x: 650, eyes: [[46, -91]], fly: -36 },
]
const GROUND = 214
const WISPS = Array.from({ length: 6 }, (_, i) => { const r = makeRand(i + 9); return { dx: (r() - 0.5) * 70, rise: 30 + r() * 50, size: 5 + r() * 9, dur: 2.4 + r() * 2, delay: r() * 2 } })

// Shadow Extraction. When the stage scrolls in, ARISE: each shadow's pool spreads on the ground, it rises out of
// it trailing purple smoke, and its eyes ignite. Hovering a project card makes its shadow step forward, and the
// reverse; clicking a shadow jumps to its project. The ARISE button sinks the army and summons it again.
function ShadowArmy({ focus, setFocus }: { focus: number | null; setFocus: (i: number | null) => void }) {
    const ref = useRef<HTMLDivElement>(null)
    const seen = useInView(ref, { once: true, margin: '-15%' })
    const near = useInView(ref)
    const [run, setRun] = useState(0)
    const [risen, setRisen] = useState(false)
    const count = resume.projects.length

    useEffect(() => {
        if (!seen) return
        const t = setTimeout(() => { setRisen(true); sfx.haki() }, run ? 550 : 0)
        return () => clearTimeout(t)
    }, [seen, run])

    const summon = () => { setRisen(false); setRun((n) => n + 1) }
    const jump = (i: number) => document.getElementById(`project-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })

    return (
        <div ref={ref} className="relative w-full max-w-4xl mx-auto">
            <div className="relative h-44 sm:h-56 md:h-72 overflow-hidden rounded-xl border border-violet-500/30 bg-[radial-gradient(ellipse_at_50%_100%,rgba(76,29,149,0.55),rgba(2,6,23,0.95)_70%)] shadow-[0_0_40px_rgba(124,58,237,0.25)]">
                {/* the command */}
                <motion.div
                    className="absolute inset-x-0 top-4 md:top-6 text-center text-4xl md:text-6xl font-black tracking-[0.25em] text-violet-100 [text-shadow:0_0_14px_rgba(167,139,250,1),0_0_40px_rgba(124,58,237,0.9)] pointer-events-none"
                    initial={false}
                    animate={risen ? { opacity: [0, 1, 1, 0.18], scale: [1.5, 1, 1, 1], letterSpacing: ['0.6em', '0.25em', '0.25em', '0.25em'] } : { opacity: 0, scale: 1.5 }}
                    transition={risen ? { duration: 2.6, times: [0, 0.15, 0.6, 1] } : { duration: 0.3 }}
                >
                    ARISE
                </motion.div>

                <svg viewBox="0 0 800 260" preserveAspectRatio="xMidYMax meet" className="absolute inset-0 w-full h-full">
                    <defs>
                        <clipPath id="above-ground"><rect width="800" height={GROUND + 2} /></clipPath>
                        <filter id="eye-glow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="2.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                    </defs>
                    <rect y={GROUND} width="800" height={260 - GROUND} fill="#05020b" />
                    <line x1="0" x2="800" y1={GROUND} y2={GROUND} stroke={RIM} strokeOpacity={0.5} />

                    {ARMY.slice(0, count).map(({ Art, x, eyes, fly }, i) => {
                        const delay = 0.35 + i * 0.45
                        const on = focus === i
                        return (
                            <g
                                key={i}
                                role="button"
                                tabIndex={0}
                                aria-label={`${SHADOWS[i].name}: ${resume.projects[i].name}. Jump to the project.`}
                                className="cursor-pointer outline-none"
                                onMouseEnter={() => setFocus(i)}
                                onMouseLeave={() => setFocus(null)}
                                onFocus={() => setFocus(i)}
                                onBlur={() => setFocus(null)}
                                onClick={() => jump(i)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); jump(i) } }}
                            >
                                {/* the pool it rises from */}
                                <motion.ellipse cx={x} cy={GROUND + 3} ry={7} fill="#000" stroke="#a855f7" strokeOpacity={0.6} initial={false} animate={{ rx: risen ? 58 : 0 }} transition={{ delay: risen ? delay - 0.25 : 0, duration: 0.5 }} style={{ filter: 'drop-shadow(0 0 8px #7c3aed)' }} />
                                {/* smoke curling up off the pool, only while the stage is on screen */}
                                {risen && near && WISPS.map((w, j) => (
                                    <motion.circle key={j} cx={x + w.dx} r={w.size} fill={j % 2 ? '#4c1d95' : '#1e1033'} initial={{ cy: GROUND, opacity: 0 }} animate={{ cy: [GROUND, GROUND - w.rise], opacity: [0, 0.7, 0] }} transition={{ duration: w.dur, delay: delay + w.delay, repeat: Infinity }} />
                                ))}
                                <g clipPath="url(#above-ground)">
                                    <motion.g
                                        initial={{ x, y: GROUND + 170 }}
                                        animate={{ x, y: risen ? GROUND + fly + (on ? -6 : 0) : GROUND + 170, scale: on ? 1.08 : 1 }}
                                        transition={{ y: risen ? { delay: on ? 0 : delay, type: 'spring', stiffness: 90, damping: 14 } : { duration: 0.4 }, scale: { duration: 0.2 } }}
                                        style={{ filter: on ? 'drop-shadow(0 0 10px #a855f7)' : 'drop-shadow(0 0 5px #6d28d9)' }}
                                    >
                                        <motion.g animate={fly && risen ? { y: [0, -6, 0] } : { y: 0 }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
                                            <g transform="scale(1.3)">
                                                <Art />
                                                {/* eyes ignite once it's up */}
                                                {eyes.map(([ex, ey]) => (
                                                    <motion.ellipse key={ex} cx={ex} cy={ey} rx={2.6} ry={1.4} fill={on ? '#e0e7ff' : '#a5b4fc'} filter="url(#eye-glow)" initial={{ opacity: 0 }} animate={{ opacity: risen ? 1 : 0, scale: on ? 1.5 : 1 }} transition={{ delay: risen && !on ? delay + 0.7 : 0, duration: 0.25 }} />
                                                ))}
                                            </g>
                                        </motion.g>
                                    </motion.g>
                                </g>
                                {/* name tag under the ground line */}
                                <motion.text x={x} y={GROUND + 30} textAnchor="middle" fontSize={13} fontWeight={800} letterSpacing="0.2em" fill={on ? '#ede9fe' : '#a78bfa'} initial={{ opacity: 0 }} animate={{ opacity: risen ? (on ? 1 : 0.7) : 0 }} transition={{ delay: risen && !on ? delay + 0.9 : 0 }} style={{ fontFamily: 'ui-monospace, monospace', textTransform: 'uppercase' }}>
                                    {SHADOWS[i].name}
                                </motion.text>
                            </g>
                        )
                    })}
                </svg>
            </div>
            <div className="mt-3 flex items-center justify-between font-mono text-[10px] md:text-xs uppercase tracking-widest text-violet-300/70">
                <span>Shadows extracted · {count}</span>
                <button type="button" onClick={summon} className="px-3 py-1 rounded border border-violet-500/50 text-violet-200 hover:bg-violet-500/15 hover:shadow-[0_0_14px_rgba(139,92,246,0.6)] transition">
                    Command: Arise
                </button>
            </div>
        </div>
    )
}

export default function Projects() {
    const [focus, setFocus] = useState<number | null>(null)
    return (
        <section className="relative md:min-h-screen w-full flex items-center justify-center py-12 md:py-20 bg-transparent">
            <div className="relative z-20 w-full max-w-[1400px] mx-auto px-5 sm:px-6 lg:px-12 flex flex-col items-center">

                {/* Header */}
                <div className="relative isolate w-full text-center mb-10 md:mb-16 space-y-4">
                    {/* 影: shadow, what the Shadow Monarch commands */}
                    <KanjiWatermark text="影" color="#60a5fa" className="right-0 top-0 md:right-auto md:left-1/2 md:-translate-x-[330%]" />
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-xl"
                    >
                        <span className="text-sm font-bold tracking-[0.2em] uppercase text-blue-500">Dungeon Records</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter text-white"
                    >
                        <span className="relative inline-block">
                            SYSTEM <span className="text-blue-500">LOGS</span>
                            {/* the System's alert every time Jinwoo gets stronger */}
                            <MangaSfx jp="レベルアップ!" en="Level up!" color="#93c5fd" tilt={-8} className="mx-auto mt-3 md:mt-0 md:absolute md:left-full md:ml-3 md:-top-6" />
                        </span>
                    </motion.h2>
                    <div className="pt-4">
                        <ShadowArmy focus={focus} setFocus={setFocus} />
                    </div>
                </div>

                {/* Projects: each one emerges from the dark, like a shadow taking form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                    {resume.projects.map((project, i) => (
                        <motion.a
                            key={project.name}
                            id={`project-${i}`}
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onMouseEnter={() => setFocus(i)}
                            onMouseLeave={() => setFocus(null)}
                            onFocus={() => setFocus(i)}
                            onBlur={() => setFocus(null)}
                            initial={{ opacity: 0, y: 40, filter: 'brightness(0)' }}
                            whileInView={{ opacity: 1, y: 0, filter: 'brightness(1)' }}
                            viewport={{ once: true, margin: '-10%' }}
                            transition={{ duration: 0.9, delay: i * 0.12, ease: 'easeOut' }}
                            className={clsx(
                                'group relative overflow-hidden flex flex-col transition-shadow duration-300',
                                PANEL,
                                focus === i && 'border-violet-400 shadow-[0_0_44px_rgba(139,92,246,0.6),inset_0_0_28px_rgba(139,92,246,0.2)]',
                            )}
                        >
                            <Scanlines />
                            <TitleBar>{SHADOWS[i] ? `Shadow · ${SHADOWS[i].name}` : 'Dungeon'}{project.year && ` · ${project.year}`}</TitleBar>
                            <div className="relative p-6 flex flex-col flex-grow">
                                <h3 className={clsx('text-xl font-bold text-white group-hover:text-sky-200 transition-colors', GLOW)}>{project.name}</h3>
                                <p className="mt-1 text-xs font-mono text-sky-300/70">{project.kind}</p>
                                {SHADOWS[i] && <p className="mt-1 mb-4 text-xs italic text-violet-200/90">{SHADOWS[i].lore}</p>}

                                <p className="text-sm text-sky-50/75 mb-6 flex-grow">{project.description}</p>

                                <div className="flex items-center justify-between mt-auto">
                                    <span className={clsx('text-[10px] font-black px-2 py-1 rounded bg-violet-500/10 text-violet-300 border border-violet-500/30 uppercase tracking-[0.3em] transition-shadow', focus === i && 'shadow-[0_0_14px_rgba(139,92,246,0.7)]')}>
                                        Arise
                                    </span>
                                    <span className="text-sm text-sky-300 group-hover:underline">{project.linkLabel} ↗</span>
                                </div>
                            </div>
                            {/* purple smoke along the bottom edge, where the shadow came up from */}
                            <div aria-hidden className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-violet-900/40 to-transparent pointer-events-none" />
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    )
}
