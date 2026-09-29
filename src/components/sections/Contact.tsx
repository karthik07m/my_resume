'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import BugSmasher from '@/components/games/BugSmasher'
import MagneticButton from '@/components/ui/MagneticButton'
import resume from '@/data/resume.json'
import { sfx } from '@/lib/sfx'

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const handle = (url: string) => url.replace(/\/$/, '').split('/').pop() ?? url

// Every channel is a breathing style; the colour drives the accent bar and the hover slash.
const CHANNELS = [
    { name: 'Email', value: resume.email, href: `mailto:${resume.email}`, breath: 'Thunder Breathing', form: 'First Form: Thunderclap and Flash', color: '#facc15' },
    { name: 'LinkedIn', value: handle(resume.links.linkedin), href: resume.links.linkedin, breath: 'Water Breathing', form: 'Eleventh Form: Dead Calm', color: '#38bdf8' },
    { name: 'GitHub', value: handle(resume.links.github), href: resume.links.github, breath: 'Flame Breathing', form: 'Ninth Form: Rengoku', color: '#f97316' },
    { name: 'Play Store', value: 'Visa Sage · Coinly', href: resume.projects[0].url, breath: 'Wind Breathing', form: 'First Form: Dust Whirlwind Cutter', color: '#4ade80' },
    { name: 'Résumé', value: resume.resumeFile, href: `${base}/${resume.resumeFile}`, breath: 'Sun Breathing', form: 'Hinokami Kagura: Dance', color: '#fb7185', download: true },
]

const EASE = [0.22, 1, 0.36, 1] as const

// Water Breathing: three layered waves drifting across the bottom of the section at different speeds.
const WAVE = 'M0 70 C 150 10, 300 130, 600 70 S 1050 10, 1200 70'
const LAYERS = [
    { color: '#ec4899', fill: 0.14, speed: 26, top: 0 },
    { color: '#a855f7', fill: 0.16, speed: 18, top: 22 },
    { color: '#38bdf8', fill: 0.22, speed: 12, top: 44 },
]
function Waves() {
    return (
        <div className="absolute inset-x-0 bottom-0 h-44 md:h-56 pointer-events-none" aria-hidden>
            {LAYERS.map((w) => (
                <motion.svg
                    key={w.color}
                    viewBox="0 0 2400 160"
                    preserveAspectRatio="none"
                    className="absolute left-0 w-[200%] h-full"
                    style={{ top: w.top }}
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{ duration: w.speed, repeat: Infinity, ease: 'linear' }}
                >
                    {[0, 1200].map((dx) => (
                        <g key={dx} transform={`translate(${dx} 0)`}>
                            <path d={`${WAVE} V 160 H 0 Z`} fill={w.color} fillOpacity={w.fill} />
                            <path d={WAVE} fill="none" stroke={w.color} strokeOpacity={0.7} strokeWidth={2} />
                        </g>
                    ))}
                </motion.svg>
            ))}
        </div>
    )
}

export default function Contact() {
    const [playing, setPlaying] = useState(false)
    const [crow, setCrow] = useState(false)
    const [copied, setCopied] = useState(false)

    const sendCrow = () => {
        setCrow(true)
        sfx.whoosh()
        setTimeout(() => { window.location.href = `mailto:${resume.email}` }, 900)
    }
    const copyEmail = async () => {
        try {
            await navigator.clipboard.writeText(resume.email)
            setCopied(true)
            sfx.click()
            setTimeout(() => setCopied(false), 1800)
        } catch { window.location.href = `mailto:${resume.email}` }
    }

    return (
        <section className="relative md:min-h-screen w-full flex items-center py-16 md:py-24 bg-transparent overflow-hidden">
            <Waves />

            <div className="relative z-20 w-full max-w-[1100px] mx-auto px-5 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">

                {/* Left: pitch and the two things a recruiter actually clicks */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 backdrop-blur-xl"
                    >
                        <span className="text-sm font-bold tracking-[0.2em] uppercase text-pink-400">Total Concentration Breathing</span>
                    </motion.div>

                    {/* Heading revealed by a katana slash */}
                    <div className="relative inline-block">
                        <motion.h2
                            initial={{ clipPath: 'inset(0 100% 0 0)' }}
                            whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
                            className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white leading-[0.95]"
                        >
                            BREATH OF<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">CODE</span>
                        </motion.h2>
                        <motion.span
                            aria-hidden
                            initial={{ left: '0%', opacity: 1 }}
                            whileInView={{ left: '100%', opacity: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
                            className="absolute top-0 bottom-0 w-[3px] -skew-x-12 bg-white shadow-[0_0_18px_#f0abfc]"
                        />
                    </div>
                    <p className="font-mono text-xs tracking-[0.3em] uppercase text-pink-300/70">First Form: Contact</p>

                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="text-lg md:text-xl text-white/75 max-w-xl leading-relaxed"
                    >
                        Building an Appian platform, hiring a lead, or just want to{' '}
                        <button
                            type="button"
                            onClick={() => setPlaying(true)}
                            className="text-pink-400 underline decoration-dotted underline-offset-4 hover:text-pink-300 transition-colors"
                        >
                            slay some bugs
                        </button>
                        ? Send a crow. I read every one.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col sm:flex-row gap-3 pt-2"
                    >
                        <div className="relative">
                            <MagneticButton
                                onClick={sendCrow}
                                className="w-full sm:w-auto whitespace-nowrap px-10 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-sm tracking-widest hover:brightness-110 transition-all shadow-lg shadow-pink-500/25"
                            >
                                SEND KASUGAI CROW
                            </MagneticButton>
                            <AnimatePresence>
                                {crow && (
                                    <motion.span
                                        key="crow"
                                        initial={{ x: '-50%', y: '-50%', opacity: 1, scale: 1, rotate: 0 }}
                                        animate={{ x: 'calc(-50% + 280px)', y: 'calc(-50% - 260px)', opacity: 0, scale: 0.3, rotate: -25 }}
                                        transition={{ duration: 0.9, ease: 'easeIn' }}
                                        onAnimationComplete={() => setCrow(false)}
                                        className="absolute left-1/2 top-1/2 text-5xl pointer-events-none z-30 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]"
                                        aria-hidden
                                    >
                                        🐦‍⬛
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                        <button
                            type="button"
                            onClick={copyEmail}
                            className="w-full sm:w-auto px-8 py-4 border border-white/20 text-white font-bold text-sm tracking-widest hover:bg-white/10 hover:border-pink-400/60 transition-colors font-mono"
                        >
                            {copied ? 'COPIED ✓' : resume.email}
                        </button>
                    </motion.div>

                    <p className="text-xs font-mono text-white/35">{resume.location} · {resume.title}</p>
                </div>

                {/* Right: every channel, one breathing style each */}
                <ul className="space-y-3">
                    {CHANNELS.map((c, i) => (
                        <motion.li
                            key={c.name}
                            initial={{ opacity: 0, x: 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: '-10%' }}
                            transition={{ delay: 0.15 + i * 0.07, type: 'spring', stiffness: 220, damping: 24 }}
                        >
                            <a
                                href={c.href}
                                download={c.download || undefined}
                                target={c.href.startsWith('http') ? '_blank' : undefined}
                                rel="noopener noreferrer"
                                style={{ '--breath': c.color } as React.CSSProperties}
                                className="group relative flex items-center gap-4 p-4 rounded-xl bg-white/[0.04] border border-white/10 hover:border-[var(--breath)] hover:bg-white/[0.07] hover:-translate-y-0.5 transition-all duration-300 backdrop-blur-sm overflow-hidden"
                            >
                                <span className="w-1 self-stretch rounded-full bg-[var(--breath)] shadow-[0_0_10px_var(--breath)] shrink-0" />
                                <span className="flex-1 min-w-0">
                                    <span className="flex items-baseline justify-between gap-3">
                                        <span className="font-bold text-white tracking-wide">{c.name}</span>
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--breath)] opacity-80 whitespace-nowrap">{c.breath}</span>
                                    </span>
                                    <span className="block text-sm text-white/55 truncate group-hover:text-white/90 transition-colors">{c.value}</span>
                                    <span className="block text-[10px] font-mono text-white/25 group-hover:text-[var(--breath)] transition-colors truncate">{c.form}</span>
                                </span>
                                <span className="text-white/30 group-hover:text-[var(--breath)] group-hover:translate-x-1 transition-all">↗</span>
                                {/* Katana slash across the row */}
                                <span aria-hidden className="absolute -inset-x-2 top-1/2 h-px -skew-y-3 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out bg-[var(--breath)] opacity-50" />
                            </a>
                        </motion.li>
                    ))}
                </ul>
            </div>

            <p className="absolute bottom-4 inset-x-0 z-20 text-center text-xs text-white/30 font-mono">© {new Date().getFullYear()} {resume.name}</p>

            <AnimatePresence>
                {playing && <BugSmasher onClose={() => setPlaying(false)} />}
            </AnimatePresence>
        </section>
    )
}
