'use client'

import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { useRef, useState } from 'react'
import { clsx } from 'clsx'
import resume from '@/data/resume.json'
import { haki } from '@/components/ui/Haki'

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
// moment: the scene everyone remembers from that arc. tie: what it stands for in this job.
type Arc = { id: string; name: string; saga: string; moment: string; tie: string; sky: [string, string]; sun: string; scene: React.ReactNode }
const ARCS: Arc[] = [
    {
        id: 'wano', name: 'Wano Country', saga: 'Final Saga · Onigashima raid',
        moment: 'Gear 5: the Drums of Liberation', tie: 'Peak form. Leading the raid on the Compliance Hydra.', sky: ['#7f1d1d', '#f59e0b'], sun: '#fde68a',
        scene: (
            <g>
                <path d="M10 74 L 60 36 L 110 74 Z" fill="#450a0a" opacity="0.7" />
                <path d="M70 74 L 120 44 L 160 74 Z" fill="#450a0a" opacity="0.5" />
                <g fill="#dc2626">
                    <rect x="54" y="36" width="6" height="38" />
                    <rect x="100" y="36" width="6" height="38" />
                    <rect x="46" y="31" width="68" height="6" rx="1" />
                    <rect x="52" y="44" width="56" height="4" />
                </g>
            </g>
        ),
    },
    {
        id: 'marineford', name: 'Marineford', saga: 'Summit War · Marine HQ',
        moment: '“The One Piece… is real!”', tie: 'One demo in front of HSBC that changed everything.', sky: ['#0f172a', '#475569'], sun: '#e2e8f0',
        scene: (
            <g>
                <path d="M26 74 V 46 H 36 V 40 H 44 V 46 H 54 V 40 H 62 V 46 H 74 V 28 H 86 V 46 H 98 V 40 H 106 V 46 H 116 V 40 H 124 V 46 H 134 V 74 Z" fill="#1e293b" />
                <rect x="78" y="34" width="8" height="40" fill="#0f172a" />
                <g fill="#fbbf24" opacity="0.8"><rect x="40" y="56" width="4" height="6" /><rect x="60" y="56" width="4" height="6" /><rect x="100" y="56" width="4" height="6" /><rect x="118" y="56" width="4" height="6" /></g>
                <motion.path d="M80 28 V 14 L 94 18.5 L 80 23 Z" fill="#f8fafc" animate={{ skewY: [0, 4, 0, -4, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} />
            </g>
        ),
    },
    {
        id: 'enies', name: 'Enies Lobby', saga: 'Water 7 Saga · Gates of Justice',
        moment: '“I want to live!” · the flag goes up in flames', tie: 'Declared war on manual scheduling. Won an award for it.', sky: ['#0c4a6e', '#38bdf8'], sun: '#fef3c7',
        scene: (
            <g>
                <rect x="22" y="22" width="44" height="52" rx="2" fill="#0f172a" />
                <rect x="94" y="22" width="44" height="52" rx="2" fill="#0f172a" />
                <rect x="26" y="26" width="36" height="44" fill="#1e293b" />
                <rect x="98" y="26" width="36" height="44" fill="#1e293b" />
                <rect x="74" y="34" width="12" height="40" fill="#e2e8f0" />
                <path d="M72 34 L 80 24 L 88 34 Z" fill="#f8fafc" />
                <motion.rect x="76" y="44" width="8" height="30" fill="#bae6fd" opacity="0.8" animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 1.6, repeat: Infinity }} />
            </g>
        ),
    },
    {
        id: 'alabasta', name: 'Alabasta', saga: 'Arabasta Saga · Desert Kingdom',
        moment: 'The X on every arm', tie: 'First real crew. Agile team, Java, JUnit, no shortcuts.', sky: ['#9a3412', '#fbbf24'], sun: '#fff7ed',
        scene: (
            <g>
                <path d="M28 74 L 74 30 L 120 74 Z" fill="#78350f" />
                <path d="M74 30 L 120 74 L 96 74 Z" fill="#451a03" opacity="0.6" />
                <path d="M104 74 L 130 50 L 156 74 Z" fill="#92400e" />
                <path d="M0 74 Q 40 64 80 74 T 160 74 V 80 H 0 Z" fill="#d97706" />
                <motion.g stroke="#fff7ed" strokeWidth="3" strokeLinecap="round" initial={{ opacity: 0 }} whileInView={{ opacity: 0.9 }} viewport={{ once: true }} transition={{ delay: 0.6 }}>
                    <line x1="22" y1="22" x2="36" y2="36" /><line x1="36" y1="22" x2="22" y2="36" />
                </motion.g>
            </g>
        ),
    },
    {
        id: 'eastblue', name: 'East Blue', saga: 'Romance Dawn · Foosha Village',
        moment: 'Shanks hands over the straw hat', tie: 'Where the voyage started: a two-month internship.', sky: ['#0369a1', '#7dd3fc'], sun: '#fef9c3',
        scene: (
            <g>
                <path d="M0 74 Q 50 58 100 70 T 160 74 Z" fill="#15803d" />
                <path d="M72 74 L 76 42 H 84 L 88 74 Z" fill="#78350f" />
                <ellipse cx="30" cy="66" rx="13" ry="3.5" fill="#fbbf24" />
                <path d="M20 66 Q 30 50 40 66 Z" fill="#fcd34d" />
                <rect x="21.5" y="61" width="17" height="2.5" fill="#dc2626" />
                <g transform="translate(80 42)">
                    <motion.g animate={{ rotate: 360 }} transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}>
                        {[0, 90, 180, 270].map((r) => (
                            <rect key={r} x="-2" y="-26" width="4" height="26" rx="1" fill="#f8fafc" transform={`rotate(${r})`} />
                        ))}
                    </motion.g>
                    <circle r="3" fill="#dc2626" />
                </g>
            </g>
        ),
    },
]

// A Grand Line island: gradient sky, sun, the arc's landmark, and a sea that never stops moving.
function Island({ arc, active }: { arc: Arc; active: boolean }) {
    return (
        <svg viewBox="0 0 160 90" className="w-full h-auto block" aria-hidden>
            <defs>
                <linearGradient id={`sky-${arc.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={arc.sky[0]} />
                    <stop offset="1" stopColor={arc.sky[1]} />
                </linearGradient>
            </defs>
            <rect width="160" height="90" fill={`url(#sky-${arc.id})`} />
            <motion.circle cx="128" cy="24" r="10" fill={arc.sun} animate={{ scale: active ? [1, 1.15, 1] : 1 }} transition={{ duration: 2.5, repeat: Infinity }} style={{ originX: '128px', originY: '24px' }} />
            {arc.scene}
            <motion.path
                d="M-40 76 Q -20 70 0 76 T 40 76 T 80 76 T 120 76 T 160 76 T 200 76 V 90 H -40 Z"
                fill="#082f49"
                opacity="0.95"
                animate={{ x: [0, -40] }}
                transition={{ duration: active ? 1.6 : 3.2, repeat: Infinity, ease: 'linear' }}
            />
        </svg>
    )
}

export default function Experience() {
    // The ship sails down the timeline as you scroll through it; each job is an island on the voyage.
    const timeline = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({ target: timeline, offset: ['start center', 'end center'] })
    const shipTop = useTransform(scrollYProgress, (v) => `${v * 100}%`)
    const count = resume.experience.length
    const [active, setActive] = useState(0)
    useMotionValueEvent(scrollYProgress, 'change', (v) => setActive(Math.min(count - 1, Math.round(v * (count - 1)))))

    return (
        <section className="relative md:min-h-screen w-full flex items-center justify-center py-12 md:py-20 bg-transparent">
            <div className="relative z-20 w-full max-w-[1000px] mx-auto px-5 sm:px-6 lg:px-12 flex flex-col items-center">

                {/* Header */}
                <div className="text-center mb-10 md:mb-20 space-y-4">
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
                        EXPERIENCE <span className="text-red-500">LOG</span>
                    </motion.h2>
                    <p className="font-mono text-xs tracking-widest uppercase text-white/40">
                        Santōryū: {SWORDS.map((s) => s.skill).join(' · ')}
                    </p>
                </div>

                {/* Timeline */}
                <div ref={timeline} className="relative w-full">
                    {/* Wake behind the ship, then the ship itself, centred on the timeline line */}
                    <div className="absolute top-0 bottom-0 left-[0.5px] md:left-[248.5px] pointer-events-none z-20" aria-hidden>
                        <motion.div style={{ height: shipTop }} className="absolute top-0 -translate-x-1/2 w-[2px] bg-gradient-to-b from-transparent to-sky-400/70" />
                        <motion.div style={{ top: shipTop }} className="absolute -translate-x-1/2 -translate-y-1/2" title="Thousand Sunny">
                            <motion.svg
                                viewBox="0 0 40 40"
                                className="w-7 h-7 md:w-10 md:h-10 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]"
                                animate={{ rotate: [-6, 6, -6] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <line x1={20} y1={4} x2={20} y2={27} stroke="#78350f" strokeWidth={1.5} />
                                <path d="M 20 5 L 33 9 L 20 13 Z" fill="#111" />
                                <circle cx={25} cy={9} r={1.6} fill="#fff" />
                                <path d="M 20 12 Q 31 17 20 25 Z" fill="#f8fafc" />
                                <path d="M 20 12 Q 9 17 20 25 Z" fill="#e2e8f0" />
                                <path d="M 5 27 L 35 27 Q 32 35 20 35 Q 8 35 5 27 Z" fill="#d97706" stroke="#78350f" strokeWidth={1} />
                                <circle cx={33} cy={27} r={3} fill="#facc15" stroke="#78350f" strokeWidth={0.8} />
                            </motion.svg>
                        </motion.div>
                    </div>
                    {resume.experience.map((job, i) => (
                        <div key={job.company + job.start} className="relative grid grid-cols-[auto_1fr] md:grid-cols-[200px_auto_1fr] gap-3 md:gap-12 group">

                            {/* Left Column: the island this job was sailed to; the one nearest the ship is the Log Pose target */}
                            <motion.div
                                initial={{ opacity: 0, y: 36, rotate: -4 }}
                                whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 1.5 : -1.5 }}
                                viewport={{ once: true, margin: '-10%' }}
                                transition={{ delay: i * 0.08, type: 'spring', stiffness: 180, damping: 18 }}
                                className="hidden md:block self-start mt-6 ml-auto w-[180px]"
                            >
                                <motion.div
                                    animate={active === i ? { y: [0, -5, 0] } : { y: 0 }}
                                    transition={active === i ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.4 }}
                                    className={clsx(
                                        'rounded-xl overflow-hidden border bg-zinc-950/80 transition-[box-shadow,border-color,transform] duration-500',
                                        active === i ? 'border-sky-400/80 shadow-[0_0_30px_rgba(56,189,248,0.35)] scale-[1.04]' : 'border-white/10 shadow-xl shadow-black/60',
                                    )}
                                >
                                    <Island arc={ARCS[i]} active={active === i} />
                                    <div className="p-3 space-y-1">
                                        <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.2em] text-white/40">
                                            <span>Arc {String(count - i).padStart(2, '0')}</span>
                                            {active === i && <span className="text-sky-400 animate-pulse">◉ Log Pose</span>}
                                        </div>
                                        <div className="text-sm font-black text-white leading-tight">{ARCS[i].name}</div>
                                        <div className="text-[10px] text-white/50 leading-snug">{ARCS[i].saga}</div>
                                        <div className="pt-1.5 text-[11px] italic text-sky-200/85 leading-snug">{ARCS[i].moment}</div>
                                        <div className="text-[9.5px] text-white/35 leading-snug">{ARCS[i].tie}</div>
                                        <div className="pt-1 text-[10px] font-mono text-white/40">{job.start} – {job.end}</div>
                                    </div>
                                </motion.div>
                            </motion.div>

                            {/* Center Column: Line & Node */}
                            <div className="relative flex flex-col items-center">
                                <div className="flex-grow w-px bg-white/10 group-hover:bg-red-500/50 transition-colors duration-500" />
                                <div className="absolute top-8 w-3 h-3 rounded-full bg-black border-2 border-red-500 group-hover:scale-125 transition-transform duration-300 z-10" />
                                <div className="flex-grow w-px bg-white/10 group-hover:bg-red-500/50 transition-colors duration-500" />
                            </div>

                            {/* Right Column: Content */}
                            <motion.div
                                initial={{ opacity: 0, x: 40 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: '-10%' }}
                                transition={{ delay: i * 0.1 + 0.1, type: 'spring', stiffness: 220, damping: 24 }}
                                className="pb-6 md:pb-12 pt-2 md:pt-6"
                            >
                                <div className={'relative p-5 md:p-8 rounded-2xl bg-white/5 border hover:bg-white/10 transition-all duration-300 backdrop-blur-sm group-hover:border-red-500/20 ' + (job.end === 'Present' ? 'border-red-500/30 shadow-[0_0_30px_rgba(220,38,38,0.25)]' : 'border-white/10')}>

                                    {/* Mobile: island chip */}
                                    <div className="md:hidden mb-4 inline-flex flex-wrap items-center gap-x-2 gap-y-1 px-2.5 py-1 rounded-full border border-white/10 bg-white/5">
                                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: `linear-gradient(${ARCS[i].sky[0]}, ${ARCS[i].sky[1]})` }} />
                                        <span className="text-xs font-bold text-white/85">{ARCS[i].name}</span>
                                        <span className="text-[11px] font-mono text-white/40">{job.start} – {job.end}</span>
                                    </div>
                                    <p className="md:hidden -mt-2 mb-4 text-[11px] italic text-sky-200/70">{ARCS[i].moment} <span className="not-italic text-white/35">· {ARCS[i].tie}</span></p>

                                    <div className="flex flex-col gap-1 mb-4">
                                        <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-red-500 transition-colors">
                                            {job.company} <span className="text-base font-normal text-white/40">· {job.location}</span>
                                        </h3>
                                        <div className="text-red-400 font-mono text-sm">{job.role}</div>
                                    </div>

                                    {/* Boss fight framing */}
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2 text-sm">
                                        <span className="text-white/30 uppercase tracking-widest text-xs">Boss:</span>
                                        <span className="text-white/80 font-bold">{job.boss.name}</span>
                                        <span className="text-red-400 tracking-[0.15em]" aria-label={`Difficulty ${job.boss.difficulty} of 5`}>
                                            {'★'.repeat(job.boss.difficulty)}<span className="text-white/20">{'★'.repeat(5 - job.boss.difficulty)}</span>
                                        </span>
                                        {job.end === 'Present' ? (
                                            <span className="ml-auto text-[10px] font-black tracking-widest px-2 py-0.5 rounded-sm border border-red-500/60 text-red-400 animate-pulse -rotate-3">
                                                IN PROGRESS
                                            </span>
                                        ) : (
                                            <span className="ml-auto text-[10px] font-black tracking-widest px-2 py-0.5 rounded-sm border-2 border-green-500/70 text-green-400 -rotate-6">
                                                CLEARED
                                            </span>
                                        )}
                                    </div>
                                    {job.client && (
                                        <p className="text-xs text-white/40 mb-4">
                                            <span className="uppercase tracking-widest text-white/30">Quest giver:</span> {job.client}
                                        </p>
                                    )}

                                    <ul className="text-[15px] md:text-base text-white/70 leading-relaxed mb-5 space-y-1.5 list-disc pl-4 md:pl-5 marker:text-red-500/60">
                                        {job.bullets.map((bullet) => (
                                            <li key={bullet}>{bullet}</li>
                                        ))}
                                    </ul>

                                    <div className="flex flex-wrap gap-2">
                                        {job.stack.split(', ').map((tech) => (
                                            <span key={tech} title="Busoshoku: Armament Haki" className="text-xs font-bold px-3 py-1 rounded-sm bg-red-500/10 text-red-400 border border-red-500/20 transition-all hover:bg-gradient-to-br hover:from-zinc-950 hover:via-zinc-700 hover:to-black hover:text-white hover:border-violet-500/60 hover:shadow-[0_0_12px_rgba(139,92,246,0.5)] cursor-default">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                    {job.end === 'Present' && (
                                        <button
                                            type="button"
                                            onClick={() => haki.unleash()}
                                            className="mt-5 text-[11px] font-mono uppercase tracking-widest text-red-400 hover:text-red-300 border-b border-dashed border-red-500/50"
                                        >
                                            Release Haoshoku Haki ⚡
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
