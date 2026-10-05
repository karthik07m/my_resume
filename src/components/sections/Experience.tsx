'use client'

import { AnimatePresence, motion, useScroll, useSpring, useTransform, useMotionValueEvent, useInView } from 'framer-motion'
import { Fragment, useRef, useState } from 'react'
import { clsx } from 'clsx'
import resume from '@/data/resume.json'
import { haki } from '@/components/ui/Haki'
import { toMonths } from '@/lib/years'
import { BossStage, KaidoStage, makeRand } from './BossFight'
import { KanjiWatermark, MangaSfx } from '@/components/ui/MangaText'

// Zoro's Santoryu in the header: one sword per core discipline.
const SWORDS = [
    { name: 'Wado Ichimonji', hilt: '#f4f4f5', angle: 0, skill: 'Appian' },
    { name: 'Sandai Kitetsu', hilt: '#b91c1c', angle: 45, skill: 'SQL' },
    { name: 'Enma', hilt: '#3b0764', angle: -45, skill: 'Integrations' },
]

// One katana drawn horizontally, centred on the origin, blade pointing right.
function Katana({ hilt }: { hilt: string }) {
    return (
        <g>
            <rect x={-92} y={-4} width={40} height={8} rx={2} fill={hilt} stroke="#000" strokeWidth={0.8} />
            <line x1={-90} y1={0} x2={-54} y2={0} stroke="#000" strokeOpacity={0.45} strokeWidth={7} strokeDasharray="3 3" />
            <ellipse cx={-49} cy={0} rx={3} ry={9} fill="#ca8a04" stroke="#000" strokeWidth={0.8} />
            <path d="M -46 -3 L 80 -3 Q 90 -2 94 3 L -46 3 Z" fill="url(#steel)" stroke="#94a3b8" strokeWidth={0.5} />
            <line x1={-44} y1={1.8} x2={86} y2={1.8} stroke="#fff" strokeOpacity={0.6} strokeWidth={0.6} />
        </g>
    )
}

// One island per job, newest first to match resume.experience: the career sailed from East Blue to Wano.
// Every island has a mechanic only it has, triggered when the ship (Log Pose) is nearest.
type SceneProps = { active: boolean }
type Arc = { id: string; name: string; saga: string; moment: string; tie: string; accent: string; sky: [string, string]; Scene: (p: SceneProps) => React.ReactElement }

// A scene is drawn in a 160×90 box that sits centred in its stage, and the stage is usually far wider than that.
// So the sky, the sea and the ground run well past the box on every side (FAR), which makes the island, its water
// and the ground the fighters stand on one picture from edge to edge, not a picture laid over a backdrop.
const FAR = { x: -480, width: 1120 }
function Sky({ id, from, to }: { id: string; from: string; to: string }) {
    return (
        <>
            <defs>
                <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="90">
                    <stop offset="0" stopColor={from} />
                    <stop offset="1" stopColor={to} />
                </linearGradient>
            </defs>
            <rect {...FAR} y="-90" height="270" fill={`url(#${id})`} />
        </>
    )
}
// One crest and one trough every 80 units, so sliding the path by 80 loops without a seam.
const WAVES = `M-480 76 Q -460 70 -440 76${Array.from({ length: 28 }, (_, i) => ` T ${-400 + i * 40} 76`).join('')} V 180 H -480 Z`
function Sea({ fast }: { fast: boolean }) {
    return (
        <motion.path
            d={WAVES}
            fill="#082f49"
            opacity={0.95}
            animate={{ x: [0, -80] }}
            transition={{ duration: fast ? 3.2 : 6.4, repeat: Infinity, ease: 'linear' }}
        />
    )
}
// The strip of ground the fighters stand on, in front of the sea.
function Ground({ fill, edge }: { fill: string; edge: string }) {
    return (
        <>
            <rect {...FAR} y="80" height="100" fill={fill} />
            <rect {...FAR} y="80" height="1.6" fill={edge} />
        </>
    )
}

// Wano: Gear 5. The world goes white and the torii beats to the Drums of Liberation.
function WanoScene({ active }: SceneProps) {
    const ink = active ? '#111111' : '#dc2626'
    return (
        <>
            <Sky id="sky-wano" from="#7f1d1d" to="#f59e0b" />
            <motion.rect {...FAR} y="-90" height="270" fill="#fafafa" initial={false} animate={{ opacity: active ? 1 : 0 }} transition={{ duration: 0.5 }} />
            <motion.circle cx="128" cy="24" r="10" initial={false} animate={{ fill: active ? '#111111' : '#fde68a' }} />
            <motion.path d="M10 74 L 60 36 L 110 74 Z" opacity="0.8" initial={false} animate={{ fill: active ? '#e5e5e5' : '#450a0a' }} />
            <motion.path d="M70 74 L 120 44 L 160 74 Z" opacity="0.6" initial={false} animate={{ fill: active ? '#d4d4d4' : '#450a0a' }} />
            <motion.g
                style={{ originX: '80px', originY: '56px' }}
                animate={active ? { scale: [1, 1.1, 1, 1.1, 1, 1] } : { scale: 1 }}
                transition={active ? { duration: 1.3, repeat: Infinity, times: [0, 0.12, 0.24, 0.36, 0.48, 1], ease: 'easeOut' } : { duration: 0.3 }}
            >
                <motion.rect x="54" y="36" width="6" height="38" initial={false} animate={{ fill: ink }} />
                <motion.rect x="100" y="36" width="6" height="38" initial={false} animate={{ fill: ink }} />
                <motion.rect x="46" y="31" width="68" height="6" rx="1" initial={false} animate={{ fill: ink }} />
                <motion.rect x="52" y="44" width="56" height="4" initial={false} animate={{ fill: ink }} />
            </motion.g>
            <Sea fast={active} />
        </>
    )
}

// Marineford: Whitebeard's quake. The island shakes and cracks when the Log Pose locks on.
const CRACKS = ['M80 90 L 76 70 L 84 58 L 72 44 L 78 30', 'M30 90 L 40 72 L 34 60 L 46 48', 'M132 90 L 122 74 L 130 62 L 118 50']
function MarinefordScene({ active }: SceneProps) {
    return (
        <>
            <Sky id="sky-marineford" from="#0f172a" to="#475569" />
            <circle cx="128" cy="24" r="10" fill="#e2e8f0" />
            <motion.g animate={active ? { x: [0, -3, 3, -2, 2, 0], y: [0, 1, -1, 1, 0, 0] } : { x: 0, y: 0 }} transition={active ? { duration: 0.5, repeat: Infinity, repeatDelay: 1.4 } : { duration: 0.2 }}>
                <path d="M26 74 V 46 H 36 V 40 H 44 V 46 H 54 V 40 H 62 V 46 H 74 V 28 H 86 V 46 H 98 V 40 H 106 V 46 H 116 V 40 H 124 V 46 H 134 V 74 Z" fill="#1e293b" />
                <rect x="78" y="34" width="8" height="40" fill="#0f172a" />
                <g fill="#fbbf24" opacity="0.8"><rect x="40" y="56" width="4" height="6" /><rect x="60" y="56" width="4" height="6" /><rect x="100" y="56" width="4" height="6" /><rect x="118" y="56" width="4" height="6" /></g>
                <motion.path d="M80 28 V 14 L 94 18.5 L 80 23 Z" fill="#f8fafc" animate={{ skewY: [0, 4, 0, -4, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} />
            </motion.g>
            <Sea fast={active} />
            {/* the bay Aokiji froze: the battlefield */}
            <Ground fill="#bfdbfe" edge="#f8fafc" />
            {CRACKS.map((d, i) => (
                <motion.path key={d} d={d} fill="none" stroke="#f8fafc" strokeWidth="1.5" strokeLinejoin="round" initial={false} animate={{ pathLength: active ? 1 : 0, opacity: active ? 1 : 0 }} transition={{ duration: 0.6, delay: active ? 0.2 + i * 0.15 : 0, ease: 'easeOut' }} />
            ))}
        </>
    )
}

// Enies Lobby: the Gates of Justice swing open and the World Government flag burns.
function EniesScene({ active }: SceneProps) {
    const gate = { type: 'spring', stiffness: 50, damping: 14 } as const
    return (
        <>
            <Sky id="sky-enies" from="#0c4a6e" to="#38bdf8" />
            <circle cx="128" cy="24" r="10" fill="#fef3c7" />
            <motion.rect x="64" y="40" width="32" height="36" fill="#bae6fd" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 1.4, repeat: Infinity }} />
            <rect x="74" y="34" width="12" height="40" fill="#e2e8f0" />
            <path d="M72 34 L 80 24 L 88 34 Z" fill="#f8fafc" />
            <line x1="80" y1="24" x2="80" y2="9" stroke="#e2e8f0" strokeWidth="1" />
            <motion.path d="M80 9 h 12 v 7 h -12 z" fill="#1e3a8a" initial={false} animate={{ opacity: active ? 0 : 1 }} transition={{ delay: active ? 1.1 : 0, duration: 0.4 }} />
            <motion.g initial={false} animate={{ opacity: active ? [0, 1, 1, 0.8, 0] : 0 }} transition={active ? { duration: 1.8, times: [0, 0.15, 0.6, 0.85, 1], delay: 0.3 } : { duration: 0.2 }}>
                <motion.path d="M80 17 Q 84 11 82 5 Q 88 9 91 3 Q 93 11 89 17 Z" fill="#f97316" animate={{ scaleY: [1, 1.15, 0.95, 1] }} transition={{ duration: 0.4, repeat: Infinity }} style={{ originX: '85px', originY: '17px' }} />
                <path d="M83 16 Q 85 12 85 9 Q 88 12 87 16 Z" fill="#fde047" />
            </motion.g>
            <motion.circle cx="87" cy="8" r="3" fill="#94a3b8" initial={false} animate={active ? { opacity: [0, 0.6, 0], y: [0, -12] } : { opacity: 0 }} transition={active ? { delay: 1.6, duration: 1.8, repeat: Infinity } : { duration: 0.2 }} />
            <motion.g initial={false} animate={{ x: active ? -28 : 0 }} transition={gate}>
                <rect x="22" y="22" width="44" height="52" rx="2" fill="#0f172a" />
                <rect x="26" y="26" width="36" height="44" fill="#1e293b" />
            </motion.g>
            <motion.g initial={false} animate={{ x: active ? 28 : 0 }} transition={gate}>
                <rect x="94" y="22" width="44" height="52" rx="2" fill="#0f172a" />
                <rect x="98" y="26" width="36" height="44" fill="#1e293b" />
            </motion.g>
            <Sea fast={active} />
            {/* the Bridge of Hesitation */}
            <Ground fill="#64748b" edge="#cbd5e1" />
        </>
    )
}

// Alabasta: Crocodile's sandstorm hides the kingdom until the Log Pose locks on; then the crew's X appears.
// Each grain blows 240 units to the right from a start spread over the whole stage width.
const GRAINS = Array.from({ length: 70 }, (_, i) => {
    const r = makeRand(i + 3)
    return { x: -400 + r() * 800, y: 4 + r() * 70, len: 4 + r() * 9, dur: 1.1 + r() * 1.4, delay: -r() * 2.5 }
})
const DUNES = `M-480 74 Q -440 64 -400 74${Array.from({ length: 13 }, (_, i) => ` T ${-320 + i * 80} 74`).join('')} V 82 H -480 Z`
function AlabastaScene({ active }: SceneProps) {
    return (
        <>
            <Sky id="sky-alabasta" from="#9a3412" to="#fbbf24" />
            <circle cx="128" cy="24" r="10" fill="#fff7ed" />
            <path d="M28 74 L 74 30 L 120 74 Z" fill="#78350f" />
            <path d="M74 30 L 120 74 L 96 74 Z" fill="#451a03" opacity="0.6" />
            <path d="M104 74 L 130 50 L 156 74 Z" fill="#92400e" />
            <path d={DUNES} fill="#d97706" />
            {/* Unmounted once it has cleared, so the grains stop looping when nobody can see them */}
            <AnimatePresence initial={false}>
                {!active && (
                    <motion.g key="storm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }}>
                        <rect {...FAR} y="-90" height="270" fill="#d97706" opacity="0.45" />
                        {/* CSS-animated: this many grains as script-driven loops would be a write per grain per frame */}
                        {GRAINS.map((g, i) => (
                            <rect key={i} x={g.x} y={g.y} width={g.len} height="1.6" rx="1" fill="#fde68a" opacity="0.9" style={{ animation: `grain ${g.dur}s linear ${g.delay}s infinite` }} />
                        ))}
                    </motion.g>
                )}
            </AnimatePresence>
            <g stroke="#fff7ed" strokeWidth="3" strokeLinecap="round" fill="none">
                <motion.path d="M22 22 L 36 36" initial={false} animate={{ pathLength: active ? 1 : 0, opacity: active ? 1 : 0 }} transition={{ delay: active ? 0.7 : 0, duration: 0.25 }} />
                <motion.path d="M36 22 L 22 36" initial={false} animate={{ pathLength: active ? 1 : 0, opacity: active ? 1 : 0 }} transition={{ delay: active ? 1.0 : 0, duration: 0.25 }} />
            </g>
            <Ground fill="#b45309" edge="#fbbf24" />
        </>
    )
}

// East Blue: Shanks's straw hat drops onto Foosha's shore as the island scrolls in; the windmill turns.
function EastBlueScene({ active }: SceneProps) {
    return (
        <>
            <Sky id="sky-eastblue" from="#0369a1" to="#7dd3fc" />
            <circle cx="128" cy="24" r="10" fill="#fef9c3" />
            <motion.path d="M96 22 q 4 -4 8 0 q 4 -4 8 0" stroke="#f8fafc" strokeWidth="1" fill="none" animate={{ x: [0, 18, 0], y: [0, -4, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} />
            <motion.path d="M30 30 q 3 -3 6 0 q 3 -3 6 0" stroke="#f8fafc" strokeWidth="1" fill="none" animate={{ x: [0, 14, 0], y: [0, 3, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
            <path d="M0 74 Q 50 58 100 70 T 160 74 Z" fill="#15803d" />
            <path d="M72 74 L 76 42 H 84 L 88 74 Z" fill="#78350f" />
            <g transform="translate(80 42)">
                <motion.g animate={{ rotate: 360 }} transition={{ duration: active ? 4 : 9, repeat: Infinity, ease: 'linear' }}>
                    {[0, 90, 180, 270].map((r) => (
                        <rect key={r} x="-2" y="-26" width="4" height="26" rx="1" fill="#f8fafc" transform={`rotate(${r})`} />
                    ))}
                </motion.g>
                <circle r="3" fill="#dc2626" />
            </g>
            <motion.g initial={{ y: -80, rotate: -30, opacity: 0 }} whileInView={{ y: 0, rotate: 0, opacity: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 80, damping: 11, delay: 0.5 }}>
                <ellipse cx="30" cy="66" rx="13" ry="3.5" fill="#fbbf24" />
                <path d="M20 66 Q 30 50 40 66 Z" fill="#fcd34d" />
                <rect x="21.5" y="61" width="17" height="2.5" fill="#dc2626" />
            </motion.g>
            <Sea fast={active} />
            {/* the shore of Arlong Park */}
            <Ground fill="#3f6212" edge="#84cc16" />
        </>
    )
}

const ARCS: Arc[] = [
    { id: 'wano', name: 'Wano Country', saga: 'Final Saga · Onigashima raid', moment: 'Gear 5: the Drums of Liberation', tie: 'Peak form. Leading the raid on the Compliance Hydra.', accent: '#fafafa', sky: ['#7f1d1d', '#f59e0b'], Scene: WanoScene },
    { id: 'marineford', name: 'Marineford', saga: 'Summit War · Marine HQ', moment: '“The One Piece… is real!”', tie: 'One demo in front of HSBC that changed everything.', accent: '#cbd5e1', sky: ['#0f172a', '#475569'], Scene: MarinefordScene },
    { id: 'enies', name: 'Enies Lobby', saga: 'Water 7 Saga · Gates of Justice', moment: '“I want to live!” · the flag goes up in flames', tie: 'Declared war on manual scheduling. Won an award for it.', accent: '#38bdf8', sky: ['#0c4a6e', '#38bdf8'], Scene: EniesScene },
    { id: 'alabasta', name: 'Alabasta', saga: 'Arabasta Saga · Desert Kingdom', moment: 'The X on every arm', tie: 'First real crew. Agile team, Java, JUnit, no shortcuts.', accent: '#fbbf24', sky: ['#9a3412', '#fbbf24'], Scene: AlabastaScene },
    { id: 'eastblue', name: 'East Blue', saga: 'Romance Dawn · Foosha Village', moment: 'Shanks hands over the straw hat', tie: 'Where the voyage started: a two-month internship.', accent: '#dc2626', sky: ['#0369a1', '#7dd3fc'], Scene: EastBlueScene },
]

function Island({ arc, active, className }: { arc: Arc; active: boolean; className?: string }) {
    // Only the islands near the viewport animate. A display:none copy (the other breakpoint's) never intersects, so it never mounts.
    const ref = useRef<SVGSVGElement>(null)
    const near = useInView(ref, { margin: '10% 0px' })
    return (
        <svg ref={ref} viewBox="0 0 160 90" className={className ?? 'w-full h-auto block'} aria-hidden>
            {near && <arc.Scene active={active} />}
        </svg>
    )
}

// The job card itself is dressed as its island: palette, background art, bullet glyph, and one mechanic each.
type Theme = {
    card: string; title: string; sub: string; role: string; label: string; strong: string; text: string
    stars: string; tag: string; stamp: string; bullet: string; marker: string; link: string
    Decor: () => React.ReactElement
}

// Wano: lacquer red and gold, seigaiha waves, and sakura petals falling the whole time.
const PETALS = Array.from({ length: 9 }, (_, i) => { const r = makeRand(i + 40); return { left: `${4 + r() * 90}%`, delay: `${-r() * 9}s`, dur: `${7 + r() * 5}s`, size: 8 + r() * 6 } })
function WanoDecor() {
    return (
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <svg className="absolute inset-0 w-full h-full opacity-[0.1]">
                <defs>
                    <pattern id="seigaiha" width="40" height="20" patternUnits="userSpaceOnUse">
                        <g fill="none" stroke="#fca5a5" strokeWidth="1">
                            <circle cx="20" cy="20" r="18" /><circle cx="20" cy="20" r="12" /><circle cx="20" cy="20" r="6" />
                            <circle cx="0" cy="0" r="18" /><circle cx="0" cy="0" r="12" /><circle cx="0" cy="0" r="6" />
                            <circle cx="40" cy="0" r="18" /><circle cx="40" cy="0" r="12" /><circle cx="40" cy="0" r="6" />
                        </g>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#seigaiha)" />
            </svg>
            <div className="absolute top-4 right-3 md:right-5 [writing-mode:vertical-rl] text-[11px] font-black tracking-[0.4em] text-amber-300/40">ワノ国 · 鬼ヶ島</div>
            {PETALS.map((p, i) => (
                <span key={i} className="absolute -top-6 block bg-pink-300/70 rounded-[70%_0_70%_0] animate-petal" style={{ left: p.left, width: p.size, height: p.size * 1.3, animationDelay: p.delay, animationDuration: p.dur }} />
            ))}
        </div>
    )
}

// Marineford: navy and white, diagonal stripes, the Marine gull, and JUSTICE on the back of the coat.
function MarinefordDecor() {
    return (
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <svg className="absolute inset-0 w-full h-full opacity-[0.05]">
                <defs>
                    <pattern id="stripes" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <rect width="7" height="14" fill="#fff" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#stripes)" />
            </svg>
            <div className="absolute -bottom-3 right-4 text-[72px] md:text-[96px] font-black leading-none tracking-tighter text-sky-100/[0.05] select-none">JUSTICE</div>
            <svg viewBox="0 0 100 60" className="absolute top-4 right-4 w-20 opacity-30">
                <path d="M5 40 Q 30 10 50 34 Q 70 10 95 40 Q 70 30 50 44 Q 30 30 5 40 Z" fill="#bae6fd" />
                <circle cx="50" cy="38" r="4" fill="#0b1220" />
            </svg>
        </div>
    )
}

// Enies Lobby: blueprint grid, a CP9 classification stamp, and the Buster Call strip across the top.
function EniesDecor() {
    return (
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <svg className="absolute inset-0 w-full h-full opacity-[0.12]">
                <defs>
                    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                        <path d="M24 0 H0 V24" fill="none" stroke="#67e8f9" strokeWidth="0.6" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
            <motion.div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-red-500 to-transparent" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }} />
            <div className="absolute top-3 right-3 md:right-5 rotate-6 border-2 border-cyan-300/30 rounded px-2 py-0.5 text-[9px] font-black tracking-[0.3em] text-cyan-300/40">CP9 · CLASSIFIED</div>
        </div>
    )
}

// Alabasta: sand and dunes, a hieroglyph band, the desert sun.
function AlabastaDecor() {
    return (
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <svg viewBox="0 0 400 200" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 w-full h-2/3 opacity-25">
                <path d="M0 200 V 120 Q 100 60 200 120 T 400 110 V 200 Z" fill="#b45309" />
                <path d="M0 200 V 160 Q 120 110 240 160 T 400 150 V 200 Z" fill="#92400e" />
            </svg>
            <div className="absolute top-6 right-6 w-16 h-16 rounded-full bg-amber-200/10 blur-sm" />
            <svg viewBox="0 0 240 16" className="absolute top-0 left-0 w-full h-4 opacity-30" preserveAspectRatio="none">
                {Array.from({ length: 12 }).map((_, i) => (
                    <g key={i} transform={`translate(${i * 20 + 4} 2)`} fill="#fcd34d">
                        {i % 3 === 0 && <path d="M0 12 L 6 0 L 12 12 Z" />}
                        {i % 3 === 1 && <><circle cx="6" cy="5" r="3.5" /><rect x="5" y="8" width="2" height="5" /></>}
                        {i % 3 === 2 && <><rect x="1" y="2" width="10" height="2" /><rect x="1" y="7" width="10" height="2" /><rect x="1" y="12" width="10" height="2" /></>}
                    </g>
                ))}
            </svg>
        </div>
    )
}

// East Blue: a manga page. Paper, halftone, speed lines, chapter header. The only light card on the site.
function EastBlueDecor() {
    return (
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <svg className="absolute inset-0 w-full h-full opacity-[0.14]">
                <defs>
                    <pattern id="halftone" width="7" height="7" patternUnits="userSpaceOnUse">
                        <circle cx="3.5" cy="3.5" r="1.1" fill="#000" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#halftone)" />
            </svg>
            <svg viewBox="0 0 400 300" preserveAspectRatio="none" className="absolute inset-0 w-full h-full opacity-[0.18]">
                {Array.from({ length: 22 }).map((_, i) => (
                    <line key={i} x1="400" y1="0" x2={-40 + i * 24} y2="300" stroke="#000" strokeWidth={i % 3 ? 0.6 : 1.4} />
                ))}
            </svg>
        </div>
    )
}

const THEMES: Record<string, Theme> = {
    wano: {
        card: 'rounded-2xl bg-[#1a0a0a] border-red-700/50 shadow-[0_0_40px_rgba(220,38,38,0.2)]',
        title: 'text-red-50', sub: 'text-red-200/70', role: 'text-amber-300', label: 'text-red-200/70', strong: 'text-amber-100', text: 'text-red-50/80',
        stars: 'text-amber-400', tag: 'bg-red-950/70 text-amber-200 border-red-600/40 rounded-sm', stamp: 'border-amber-400/70 text-amber-300', bullet: '❀', marker: 'text-pink-400', link: 'text-amber-300 hover:text-amber-200 border-amber-500/50',
        Decor: WanoDecor,
    },
    marineford: {
        card: 'rounded-2xl bg-[#0b1322] border-sky-300/30 shadow-[0_0_30px_rgba(56,189,248,0.12)]',
        title: 'text-white', sub: 'text-sky-200/70', role: 'text-sky-300', label: 'text-sky-200/70', strong: 'text-sky-50', text: 'text-slate-200/80',
        stars: 'text-sky-300', tag: 'bg-sky-950/70 text-sky-200 border-sky-400/40 rounded-full', stamp: 'border-sky-300/70 text-sky-200', bullet: '⚓', marker: 'text-sky-400', link: 'text-sky-300 border-sky-400/50',
        Decor: MarinefordDecor,
    },
    enies: {
        card: 'rounded-md bg-[#07192a] border-cyan-400/30 shadow-[0_0_30px_rgba(34,211,238,0.12)]',
        title: 'text-cyan-50', sub: 'text-cyan-200/70', role: 'text-cyan-300 font-mono', label: 'text-cyan-200/70', strong: 'text-cyan-50', text: 'text-cyan-50/80',
        stars: 'text-cyan-300', tag: 'bg-cyan-950/70 text-cyan-200 border-cyan-400/40 rounded-none font-mono', stamp: 'border-cyan-300/70 text-cyan-200', bullet: '§', marker: 'text-cyan-400', link: 'text-cyan-300 border-cyan-400/50',
        Decor: EniesDecor,
    },
    alabasta: {
        card: 'rounded-2xl bg-gradient-to-br from-[#2b1a0a] via-[#3a2410] to-[#1e1307] border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.12)]',
        title: 'text-amber-50', sub: 'text-amber-200/70', role: 'text-amber-300', label: 'text-amber-200/70', strong: 'text-amber-50', text: 'text-amber-50/80',
        stars: 'text-amber-400', tag: 'bg-amber-950/60 text-amber-200 border-amber-500/40 rounded-sm', stamp: 'border-amber-300/70 text-amber-200', bullet: '✕', marker: 'text-amber-400', link: 'text-amber-300 border-amber-500/50',
        Decor: AlabastaDecor,
    },
    eastblue: {
        card: 'rounded-none bg-[#f4efe3] border-[3px] border-black shadow-[8px_8px_0_#000]',
        title: 'text-black', sub: 'text-black/70', role: 'text-black font-black', label: 'text-black/60', strong: 'text-black', text: 'text-black/80',
        stars: 'text-black', tag: 'bg-black text-[#f4efe3] border-black rounded-none', stamp: 'border-black text-black', bullet: '★', marker: 'text-black', link: 'text-black border-black/50',
        Decor: EastBlueDecor,
    },
}

type Job = (typeof resume.experience)[number]

function JobCard({ job, arc, active, arcNo }: { job: Job; arc: Arc; active: boolean; arcNo: number }) {
    const t = THEMES[arc.id]
    const header = (
        <div className="max-w-[55vw] md:max-w-sm">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-white/60">
                <span>Arc {String(arcNo).padStart(2, '0')}</span>
                {active && <span className="hidden sm:inline animate-pulse" style={{ color: arc.accent }}>◉ Log Pose</span>}
            </div>
            <div className="text-base md:text-lg font-black text-white leading-tight">{arc.name}</div>
            <div className="hidden sm:block text-[11px] italic text-white/70">{arc.moment}</div>
        </div>
    )
    return (
        <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            // Marineford only: Whitebeard's tremor when you hover the card
            whileHover={arc.id === 'marineford' ? { x: [0, -3, 3, -2, 2, 0], transition: { duration: 0.45 } } : undefined}
            className="pb-6 md:pb-12 pt-2 md:pt-6"
        >
            <div className={clsx('relative overflow-hidden border transition-all duration-300', t.card)}>
                {/* The island opens the card: Kaido's sky on Wano, a boss fight everywhere else */}
                <div className={clsx('relative', arc.id === 'eastblue' ? 'border-b-[3px] border-black' : 'border-b border-white/10')}>
                    {arc.id === 'wano' ? (
                        <KaidoStage sky={arc.sky} header={header} island={<Island arc={arc} active={active} />} />
                    ) : (
                        <BossStage arcId={arc.id} maxHp={job.boss.difficulty * 2} sky={arc.sky} header={header} island={<Island arc={arc} active={active} />} />
                    )}
                </div>
                <div className="relative p-5 md:p-8">
                    <t.Decor />
                    {/* Wide screens: details and stack on the left, bullets on the right, so lines stay readable */}
                    <div className="relative lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-x-12">
                        <div className="lg:col-start-1 lg:row-start-1">
                            <p className={clsx('mb-3 text-[11px] font-mono', t.sub)}>{job.start} – {job.end} · <span className="italic">{arc.tie}</span></p>
                            <div className="flex flex-col gap-1 mb-4">
                                <h3 className={clsx('text-xl md:text-2xl font-bold transition-colors', t.title)}>
                                    {job.company} <span className={clsx('text-base font-normal', t.sub)}>· {job.location}</span>
                                </h3>
                                <div className={clsx('font-mono text-sm', t.role)}>{job.role}</div>
                            </div>

                            {/* Boss fight framing */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2 text-sm">
                                <span className={clsx('uppercase tracking-widest text-xs', t.label)}>Boss:</span>
                                <span className={clsx('font-bold', t.strong)}>{job.boss.name}</span>
                                <span className={clsx('tracking-[0.15em]', t.stars)} aria-label={`Difficulty ${job.boss.difficulty} of 5`}>
                                    {'★'.repeat(job.boss.difficulty)}<span className="opacity-25">{'★'.repeat(5 - job.boss.difficulty)}</span>
                                </span>
                                {job.end === 'Present' ? (
                                    <span className={clsx('ml-auto text-[10px] font-black tracking-widest px-2 py-0.5 rounded-sm border animate-pulse -rotate-3', t.stamp)}>IN PROGRESS</span>
                                ) : (
                                    // Stamped onto the card as it scrolls in
                                    <motion.span
                                        initial={{ scale: 2.4, opacity: 0 }}
                                        whileInView={{ scale: 1, opacity: 1 }}
                                        viewport={{ once: true, margin: '-15%' }}
                                        transition={{ delay: 0.35, type: 'spring', stiffness: 420, damping: 20 }}
                                        className={clsx('ml-auto text-[10px] font-black tracking-widest px-2 py-0.5 rounded-sm border-2 -rotate-6', t.stamp)}
                                    >
                                        CLEARED
                                    </motion.span>
                                )}
                            </div>
                            {job.client && (
                                <p className={clsx('text-xs mb-4', t.sub)}>
                                    <span className={clsx('uppercase tracking-widest', t.label)}>Quest giver:</span> {job.client}
                                </p>
                            )}
                        </div>

                        <ul className={clsx('text-[15px] md:text-base leading-relaxed mb-5 space-y-2 lg:mb-0 lg:col-start-2 lg:row-start-1 lg:row-span-2', t.text)}>
                            {job.bullets.map((bullet, bi) => (
                                <li key={bullet} className="relative flex gap-2.5">
                                    <span className={clsx('shrink-0 select-none', t.marker)} aria-hidden>{t.bullet}</span>
                                    <span>{bullet}</span>
                                    {arc.id === 'enies' && (
                                        // Poneglyph: each line stays sealed until Robin reads it as the card scrolls in
                                        <motion.span
                                            aria-hidden
                                            className="absolute inset-y-0 left-6 right-0 rounded-sm origin-right bg-[repeating-linear-gradient(90deg,#0e7490_0_7px,#164e63_7px_14px)]"
                                            initial={{ scaleX: 1 }}
                                            whileInView={{ scaleX: 0 }}
                                            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                                            transition={{ duration: 0.6, delay: 0.15 + bi * 0.1, ease: [0.22, 1, 0.36, 1] }}
                                        />
                                    )}
                                </li>
                            ))}
                        </ul>

                        {job.award && (
                            // The haul from this island: awards and recognition, set apart like the highlight on the PDF
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-10%' }}
                                className={clsx('mb-5 flex gap-3 rounded-sm border-l-4 px-3 py-2 lg:mt-5 lg:mb-0 lg:col-start-2 lg:row-start-3', t.text)}
                                style={{ borderColor: arc.accent, background: `${arc.accent}1f` }}
                            >
                                <span className="shrink-0 text-xl font-black leading-none" style={{ color: arc.accent }} aria-hidden>宝</span>
                                <p className="text-sm leading-snug">
                                    <span className={clsx('mr-2 text-[10px] font-black uppercase tracking-widest', t.label)}>Treasure claimed</span>
                                    <span className="font-semibold">{job.award}</span>
                                </p>
                            </motion.div>
                        )}

                        <div className="lg:col-start-1 lg:row-start-2 lg:self-end">
                            <div className="flex flex-wrap gap-2">
                                {job.stack.split(', ').map((tech) => (
                                    <span key={tech} title="Busoshoku: Armament Haki" className={clsx('text-xs font-bold px-3 py-1 border transition-all hover:bg-gradient-to-br hover:from-zinc-950 hover:via-zinc-700 hover:to-black hover:text-white hover:border-violet-500/60 hover:shadow-[0_0_12px_rgba(139,92,246,0.5)] cursor-default', t.tag)}>
                                        {tech}
                                    </span>
                                ))}
                            </div>
                            {job.end === 'Present' && (
                                <button type="button" onClick={() => haki.unleash()} className={clsx('mt-5 text-[11px] font-mono uppercase tracking-widest border-b border-dashed', t.link)}>
                                    Release Haoshoku Haki ⚡
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

// A break of more than half a year between jobs gets a timeskip marker, filled with whatever study overlaps it,
// so a recruiter reading only the timeline doesn't see an unexplained gap.
function timeskip(i: number) {
    const prev = resume.experience[i + 1]
    if (!prev || toMonths(resume.experience[i].start) - toMonths(prev.end) <= 6) return null
    return { from: prev.end, to: resume.experience[i].start, study: resume.education.find((e) => e.period.startsWith(prev.end.split(' ')[1])) }
}

function Timeskip({ from, to, study }: NonNullable<ReturnType<typeof timeskip>>) {
    return (
        <div className="relative grid grid-cols-[auto_1fr] gap-3 md:gap-8">
            <div className="relative flex flex-col items-center">
                <div className="flex-grow w-px border-l border-dashed border-sky-400/40" />
                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 bg-black border-2 border-sky-400 z-10" />
            </div>
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                className="my-4 md:my-6 px-4 py-3 rounded-lg border border-dashed border-sky-400/30 bg-sky-950/20"
            >
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-sky-300/70">Timeskip · {from} – {to}</div>
                {study ? (
                    <div className="mt-1 text-sm text-white/80">
                        Training arc: <span className="font-bold text-white">{study.degree}</span>, {study.school}{study.note && <span className="text-white/65"> · {study.note}</span>}
                    </div>
                ) : (
                    <div className="mt-1 text-sm text-white/60">Off the Grand Line.</div>
                )}
            </motion.div>
        </div>
    )
}

// Arcs are newest first, so every arc from Enies Lobby down is Going Merry territory.
const MERRY_UNTIL = ARCS.findIndex((a) => a.id === 'enies')

function Ship({ kind }: { kind: 'merry' | 'sunny' }) {
    return (
        // Rocks with a CSS animation: that runs off the main thread, so the ship costs nothing while the rest of the page is read.
        <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-[0_0_8px_rgba(56,189,248,0.6)] motion-safe:animate-[rock_3s_ease-in-out_infinite]">
            <line x1={20} y1={4} x2={20} y2={27} stroke="#78350f" strokeWidth={1.5} />
            <path d="M 20 5 L 33 9 L 20 13 Z" fill="#111" />
            <circle cx={25} cy={9} r={1.6} fill="#fff" />
            {kind === 'sunny' ? (
                <>
                    <path d="M 20 12 Q 31 17 20 25 Z" fill="#f8fafc" />
                    <path d="M 20 12 Q 9 17 20 25 Z" fill="#e2e8f0" />
                    <path d="M 5 27 L 35 27 Q 32 35 20 35 Q 8 35 5 27 Z" fill="#d97706" stroke="#78350f" strokeWidth={1} />
                    {/* Lion figurehead */}
                    <circle cx={33} cy={27} r={3} fill="#facc15" stroke="#78350f" strokeWidth={0.8} />
                </>
            ) : (
                <>
                    {/* One square sail with the Jolly Roger on it */}
                    <rect x={11} y={12} width={18} height={12} rx={1} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={0.6} />
                    <circle cx={20} cy={17} r={2.2} fill="#111" />
                    <path d="M 16 21 L 24 23 M 24 21 L 16 23" stroke="#111" strokeWidth={0.9} />
                    <path d="M 6 27 L 33 27 Q 31 34 20 34 Q 9 34 6 27 Z" fill="#a16207" stroke="#713f12" strokeWidth={1} />
                    {/* Sheep figurehead: white wool, curled horns */}
                    <circle cx={34} cy={25} r={2.8} fill="#fafafa" stroke="#a3a3a3" strokeWidth={0.6} />
                    <circle cx={35.6} cy={23.4} r={1} fill="none" stroke="#ca8a04" strokeWidth={0.7} />
                </>
            )}
        </svg>
    )
}

export default function Experience() {
    // The ship sails down the timeline as you scroll through it; each job is an island on the voyage.
    const timeline = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({ target: timeline, offset: ['start center', 'end center'] })
    // The ship glides after the scroll position instead of sticking to it. It and its wake move with transforms only,
    // so sailing never forces a layout.
    const voyage = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.5 })
    const shipY = useTransform(voyage, (v) => `${(v - 1) * 100}%`)
    const count = resume.experience.length
    const [active, setActive] = useState(0)
    // Canon ship swap: the Merry sails up to Enies Lobby, the Sunny from Marineford on.
    const merry = active >= MERRY_UNTIL
    const [funeral, setFuneral] = useState(false)
    const funeralTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
    useMotionValueEvent(scrollYProgress, 'change', (v) => {
        const next = Math.min(count - 1, Math.round(v * (count - 1)))
        if (active >= MERRY_UNTIL && next < MERRY_UNTIL) {
            setFuneral(true)
            clearTimeout(funeralTimer.current)
            funeralTimer.current = setTimeout(() => setFuneral(false), 2600)
        }
        setActive(next)
    })

    return (
        <section className="relative md:min-h-screen w-full flex items-center justify-center py-12 md:py-20 bg-transparent">
            <div className="relative z-20 w-full max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-12 flex flex-col items-center">

                {/* Header */}
                <div className="relative isolate text-center mb-10 md:mb-20 space-y-4">
                    {/* 海賊王: King of the Pirates, the title Luffy is chasing */}
                    <KanjiWatermark text="海賊王" color="#ef4444" className="left-0 top-0 md:left-1/2 md:-translate-x-[330%]" />
                    <svg viewBox="-100 -100 200 200" className="w-24 md:w-28 mx-auto" role="img" aria-label="Zoro's three swords: Appian, SQL, Integrations">
                        <defs>
                            <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0" stopColor="#f8fafc" />
                                <stop offset="1" stopColor="#64748b" />
                            </linearGradient>
                        </defs>
                        {SWORDS.map((s, i) => (
                            <motion.g
                                key={s.name}
                                initial={{ rotate: s.angle * 3, opacity: 0 }}
                                whileInView={{ rotate: s.angle, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ type: 'spring', stiffness: 120, damping: 12, delay: i * 0.15 }}
                            >
                                <Katana hilt={s.hilt} />
                            </motion.g>
                        ))}
                    </svg>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 backdrop-blur-xl"
                    >
                        <span className="text-sm font-bold tracking-[0.2em] uppercase text-red-500">Career Path · Grand Line</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter text-white"
                    >
                        <span className="relative inline-block">
                            EXPERIENCE <span className="text-red-500">LOG</span>
                            {/* ドン: the sound effect Oda stamps on every big entrance */}
                            <MangaSfx jp="ドン!" en="Don!" color="#facc15" tilt={-10} className="mx-auto mt-3 md:mt-0 md:absolute md:left-full md:ml-3 md:-top-6" />
                        </span>
                    </motion.h2>
                    <p className="font-mono text-xs tracking-widest uppercase text-white/65">
                        Santōryū: {SWORDS.map((s) => s.skill).join(' · ')}
                    </p>
                </div>

                {/* Timeline */}
                <div ref={timeline} className="relative w-full">
                    {/* Wake behind the ship, then the ship itself, centred on the timeline line */}
                    <div className="absolute top-0 bottom-0 left-[0.5px] pointer-events-none z-20" aria-hidden>
                        <motion.div style={{ scaleY: voyage }} className="absolute inset-y-0 -translate-x-1/2 w-[2px] origin-top will-change-transform bg-gradient-to-b from-transparent to-sky-400/70" />
                        {/* A full-height rail, slid up by the distance still to sail: its bottom edge, and the ship on it, sit at the current position */}
                        <motion.div style={{ y: shipY }} className="absolute inset-y-0 w-0 will-change-transform">
                            <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-7 h-7 md:w-10 md:h-10">
                                <AnimatePresence initial={false}>
                                    {merry ? (
                                        // Leaving Enies Lobby the Merry gets her Viking funeral: she burns and sinks.
                                        <motion.div
                                            key="merry"
                                            className="absolute inset-0"
                                            title="Going Merry"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1, y: 0, rotate: 0, filter: 'sepia(0) saturate(1) hue-rotate(0deg) brightness(1) drop-shadow(0 0 0px #f97316)' }}
                                            exit={{ opacity: 0, y: 14, rotate: 25, filter: 'sepia(1) saturate(6) hue-rotate(-25deg) brightness(1.3) drop-shadow(0 0 10px #f97316)', transition: { duration: 1.8, ease: 'easeIn' } }}
                                        >
                                            <Ship kind="merry" />
                                        </motion.div>
                                    ) : (
                                        <motion.div key="sunny" className="absolute inset-0" title="Thousand Sunny" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.6 }}>
                                            <Ship kind="sunny" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <AnimatePresence>
                                    {funeral && (
                                        <motion.span
                                            key="thanks"
                                            initial={{ opacity: 0, x: 4 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="hidden md:block absolute right-full top-1/2 -translate-y-1/2 mr-2 whitespace-nowrap font-mono text-[10px] italic text-orange-300"
                                        >
                                            Thank you, Merry.
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                    {resume.experience.map((job, i) => { const skip = timeskip(i); return (
                        <Fragment key={job.company + job.start}>
                        <div className="relative grid grid-cols-[auto_1fr] gap-3 md:gap-8 group">
                            {/* Center Column: Line & Node */}
                            <div className="relative flex flex-col items-center">
                                <div className="flex-grow w-px bg-white/10 group-hover:bg-red-500/50 transition-colors duration-500" />
                                {/* The node locks on, in the island's colour, while the Log Pose points at this job */}
                                <div
                                    className={clsx('absolute top-8 w-3 h-3 rounded-full border-2 group-hover:scale-125 transition-all duration-300 z-10', active === i ? 'scale-125' : 'bg-black border-red-500')}
                                    style={active === i ? { background: ARCS[i].accent, borderColor: ARCS[i].accent, boxShadow: `0 0 12px ${ARCS[i].accent}` } : undefined}
                                >
                                    {active === i && <span className="absolute -inset-1 rounded-full border motion-safe:animate-ping" style={{ borderColor: ARCS[i].accent }} />}
                                </div>
                                <div className="flex-grow w-px bg-white/10 group-hover:bg-red-500/50 transition-colors duration-500" />
                            </div>

                            {/* Right Column: the job card, dressed as its island */}
                            <JobCard job={job} arc={ARCS[i]} active={active === i} arcNo={count - i} />
                        </div>
                        {skip && <Timeskip {...skip} />}
                        </Fragment>
                    ) })}
                </div>
            </div>
        </section>
    )
}
