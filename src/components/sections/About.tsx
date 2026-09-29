'use client'

import Section from '@/components/ui/Section'
import resume from '@/data/resume.json'
import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

// Anime names for the skill groups in resume.json, in order.
const groupTheme = [
    { name: 'The Heavy Artillery', icon: '📜' },
    { name: 'Emperor Eye', icon: '👁️' },
    { name: 'The Zone', icon: '🏀' },
    { name: 'Sage Mode', icon: '☁️' },
]

// Akashi's Emperor Eye: red and gold eyes that follow the pointer, so the section literally sees your next move.
function EmperorEye() {
    const eyes = useRef<HTMLDivElement>(null)
    useEffect(() => {
        const el = eyes.current
        if (!el) return
        const irises = el.querySelectorAll<HTMLElement>('[data-iris]')
        const onMove = (e: PointerEvent) => {
            irises.forEach((iris) => {
                const r = iris.parentElement!.getBoundingClientRect()
                const dx = e.clientX - (r.left + r.width / 2)
                const dy = e.clientY - (r.top + r.height / 2)
                const d = Math.min(7, Math.hypot(dx, dy) / 40)
                const a = Math.atan2(dy, dx)
                iris.style.transform = `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d}px)`
            })
        }
        window.addEventListener('pointermove', onMove, { passive: true })
        return () => window.removeEventListener('pointermove', onMove)
    }, [])
    return (
        <div ref={eyes} className="inline-flex gap-1.5" title="Emperor Eye" aria-hidden>
            {['#dc2626', '#f59e0b'].map((c) => (
                <div key={c} className="relative w-8 h-5 rounded-[50%] bg-zinc-100 overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
                    <div
                        data-iris
                        className="absolute left-1/2 top-1/2 w-3.5 h-3.5 -ml-[7px] -mt-[7px] rounded-full transition-transform duration-75"
                        style={{ background: `radial-gradient(circle, #000 32%, ${c} 36%, ${c} 80%, #000 84%)` }}
                    />
                </div>
            ))}
        </div>
    )
}

const skillCount = resume.skills.reduce((n, g) => n + g.items.length, 0)

const stats = [
    { label: 'Experience', value: '7+ Years', icon: '📅' },
    { label: 'Level', value: 'Senior', icon: '🥋' },
    { label: 'Certification', value: 'Appian L2', icon: '🏅' },
    { label: 'Tech Stack', value: `${skillCount}+`, icon: '⚡' }
]

export default function About() {
    return (
        <Section id="about" className="relative py-12 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                {/* Left Column: Title & Stats */}
                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="inline-flex items-center gap-3 px-4 py-2 mb-4 rounded-full bg-orange-500/10 border border-orange-500/20 backdrop-blur-xl">
                            <EmperorEye />
                            <span className="text-sm font-bold tracking-[0.2em] uppercase text-orange-500">Seirin · Phantom Sixth Man</span>
                        </div>
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 drop-shadow-lg">
                            THE CODE I LIVE BY
                        </h2>
                        <div className="h-1 w-32 bg-orange-500 rounded-full mb-8" />

                        <div className="grid grid-cols-2 gap-6 max-w-md">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-xl"
                                >
                                    <div className="text-3xl mb-2">{stat.icon}</div>
                                    <div className="text-xl sm:text-2xl font-bold text-white font-mono">{stat.value}</div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-white/50">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Training Arc (Education) */}
                        <div className="mt-10 max-w-md">
                            <h3 className="text-lg font-bold mb-3 text-orange-400 flex items-center gap-2">
                                <span>🎓</span> Training Arc
                            </h3>
                            <ul className="space-y-2 text-sm text-white/70">
                                {resume.education.map((edu) => (
                                    <li key={edu.degree} className="flex flex-col sm:flex-row sm:gap-3">
                                        <span className="font-mono text-white/40 shrink-0">{edu.period}</span>
                                        <span>{edu.degree}, {edu.school}{edu.note && <span className="text-white/40"> · {edu.note}</span>}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Content */}
                <div className="relative z-10 space-y-8">
                    {/* Mission Report (Bio) */}
                    <motion.div
                        className="bg-black/60 backdrop-blur-xl border border-orange-500/30 p-5 sm:p-8 rounded-2xl shadow-2xl relative overflow-hidden group"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl group-hover:bg-orange-500/30 transition-colors" />

                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                            <span className="text-3xl">👨‍💻</span> Mission Report
                        </h3>
                        <div className="space-y-4 text-base sm:text-lg text-white/80 leading-relaxed">
                            {resume.about.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                            ))}
                        </div>
                    </motion.div>

                    {/* Skills grouped by arc */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <h3 className="text-xl font-bold text-orange-400 flex items-center gap-2">
                            <span className="animate-spin-slow inline-block">⚡</span> Skills & Superpowers
                        </h3>
                        {resume.skills.map((group, gi) => (
                            <div key={group.group}>
                                <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">
                                    {groupTheme[gi]?.icon} {groupTheme[gi]?.name ?? group.group} <span className="text-white/25">({group.group})</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {group.items.map((skill, i) => (
                                        <motion.span
                                            key={skill}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.04 }}
                                            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm font-medium text-white/70 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all cursor-default"
                                        >
                                            {skill}
                                        </motion.span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </Section>
    )
}
