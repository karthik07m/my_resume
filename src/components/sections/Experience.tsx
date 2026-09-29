'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
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

export default function Experience() {
    // The ship sails down the timeline as you scroll through it; each job is an island on the voyage.
    const timeline = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({ target: timeline, offset: ['start center', 'end center'] })
    const shipTop = useTransform(scrollYProgress, (v) => `${v * 100}%`)

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

                            {/* Left Column: Wanted poster (bounty grows with the career) */}
                            <motion.div
                                initial={{ opacity: 0, x: -20, rotate: -6 }}
                                whileInView={{ opacity: 1, x: 0, rotate: i % 2 ? 2 : -2 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="hidden md:block self-start mt-6 ml-auto w-[170px] p-2 bg-gradient-to-b from-[#f1e2bd] to-[#dcc28c] text-[#3b2a1a] font-serif text-center shadow-xl shadow-black/60"
                            >
                                <div className="border border-[#3b2a1a]/70 px-2 py-2">
                                    <div className="text-2xl font-black tracking-[0.1em] leading-none scale-y-125">WANTED</div>
                                    <div className="my-2 py-2 bg-[#c9ad78] border border-[#3b2a1a]/60 text-3xl font-black">{job.start.split(' ')[1]}</div>
                                    <div className="text-[9px] font-bold tracking-[0.25em]">DEAD OR ALIVE</div>
                                    <div className="text-sm font-black leading-tight">{job.company}</div>
                                    <div className="mt-1 text-base font-black">฿ {job.bounty}-</div>
                                    <div className="mt-1 text-[9px] font-mono opacity-70">{job.start} – {job.end}</div>
                                </div>
                            </motion.div>

                            {/* Center Column: Line & Node */}
                            <div className="relative flex flex-col items-center">
                                <div className="flex-grow w-px bg-white/10 group-hover:bg-red-500/50 transition-colors duration-500" />
                                <div className="absolute top-8 w-3 h-3 rounded-full bg-black border-2 border-red-500 group-hover:scale-125 transition-transform duration-300 z-10" />
                                <div className="flex-grow w-px bg-white/10 group-hover:bg-red-500/50 transition-colors duration-500" />
                            </div>

                            {/* Right Column: Content */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 + 0.1 }}
                                className="pb-6 md:pb-12 pt-2 md:pt-6"
                            >
                                <div className={'relative p-5 md:p-8 rounded-2xl bg-white/5 border hover:bg-white/10 transition-all duration-300 backdrop-blur-sm group-hover:border-red-500/20 ' + (job.end === 'Present' ? 'border-red-500/30 shadow-[0_0_30px_rgba(220,38,38,0.25)]' : 'border-white/10')}>

                                    {/* Mobile Date */}
                                    <div className="md:hidden mb-4 inline-flex flex-wrap items-baseline gap-x-2 px-2 py-1 bg-gradient-to-b from-[#f1e2bd] to-[#dcc28c] text-[#3b2a1a] font-serif -rotate-1">
                                        <span className="text-xs font-black tracking-widest">WANTED</span>
                                        <span className="text-sm font-black">฿ {job.bounty}-</span>
                                        <span className="text-[11px] font-mono">{job.start} – {job.end}</span>
                                    </div>

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
