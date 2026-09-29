'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import BugSmasher from '@/components/games/BugSmasher'
import MagneticButton from '@/components/ui/MagneticButton'
import resume from '@/data/resume.json'
import { sfx } from '@/lib/sfx'

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

// Deterministic particle positions (same on server and client, so no hydration mismatch and no effect needed).
let seed = 7
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)
const particles = Array.from({ length: 20 }).map(() => ({
    top: `${rand() * 100}%`,
    left: `${rand() * 100}%`,
    delay: `${rand() * 2}s`,
    opacity: rand() * 0.5
}))

const socials = [
    { name: 'GitHub', href: resume.links.github, breath: 'Flame Breathing', color: '#f97316' },
    { name: 'LinkedIn', href: resume.links.linkedin, breath: 'Water Breathing', color: '#38bdf8' },
    { name: 'Play Store', href: resume.projects[0].url, breath: 'Wind Breathing', color: '#4ade80' },
    { name: 'Résumé', href: `${base}/${resume.resumeFile}`, breath: 'Sun Breathing', color: '#facc15' },
]

export default function Contact() {
    const [playing, setPlaying] = useState(false)
    const [crow, setCrow] = useState(false)
    const sendCrow = () => {
        setCrow(true)
        sfx.whoosh()
        setTimeout(() => { window.location.href = `mailto:${resume.email}` }, 900)
    }
    return (
        <section className="relative md:min-h-screen w-full flex items-center justify-center py-12 md:py-20 bg-transparent">
            <div className="relative z-20 w-full max-w-4xl mx-auto px-6 text-center">

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="space-y-8"
                >
                    {/* Demon Slayer Aesthetic Header */}
                    <div className="inline-block relative">
                        <div className="absolute inset-0 bg-pink-500/20 blur-xl rounded-full" />
                        <h2 className="relative text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-white mb-2">
                            BREATH OF <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">CODE</span>
                        </h2>
                        <p className="text-base sm:text-xl text-white/60 font-mono tracking-widest uppercase">Total Concentration Breathing · First Form: Contact</p>
                    </div>

                    <p className="text-lg md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                        Ready to{' '}
                        <button
                            type="button"
                            onClick={() => setPlaying(true)}
                            className="text-pink-400 underline decoration-dotted underline-offset-4 hover:text-pink-300 transition-colors"
                        >
                            slay some bugs
                        </button>
                        {' '}or build the next big thing? Send a crow my way.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6 md:pt-8 w-full">
                        <div className="relative w-full sm:w-auto">
                            <MagneticButton
                                onClick={sendCrow}
                                className="w-full sm:w-auto px-12 py-5 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-lg tracking-widest hover:brightness-110 transition-all shadow-lg shadow-pink-500/25"
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

                        <div className="flex gap-6 text-white/50">
                            {socials.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.href}
                                    target={social.href.startsWith('http') ? '_blank' : undefined}
                                    rel="noopener noreferrer"
                                    style={{ '--breath': social.color } as React.CSSProperties}
                                    className="group relative flex flex-col items-center gap-1 hover:text-[var(--breath)] transition-colors uppercase text-sm tracking-widest font-bold"
                                >
                                    {social.name}
                                    <span className="text-[9px] tracking-wider text-white/30 group-hover:text-[var(--breath)] transition-colors">{social.breath}</span>
                                    {/* Katana slash in the breathing style's colour */}
                                    <span aria-hidden className="absolute -inset-x-3 top-[45%] h-[2px] -skew-y-12 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out bg-[var(--breath)] shadow-[0_0_10px_var(--breath)]" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Direct channels */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-x-8 gap-y-2 pt-6 font-mono text-sm text-white/50">
                        <a href={`mailto:${resume.email}`} className="hover:text-pink-400 transition-colors">{resume.email}</a>
                        <span>{resume.location}</span>
                    </div>

                    {/* Decorative Particles */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none overflow-hidden" aria-hidden>
                        {particles.map((p, i) => (
                            <div
                                key={i}
                                className="absolute w-1 h-1 bg-pink-500 rounded-full animate-pulse"
                                style={{ top: p.top, left: p.left, animationDelay: p.delay, opacity: p.opacity }}
                            />
                        ))}
                    </div>
                </motion.div>

                <p className="mt-24 text-xs text-white/30 font-mono">© {new Date().getFullYear()} {resume.name}</p>
            </div>

            <AnimatePresence>
                {playing && <BugSmasher onClose={() => setPlaying(false)} />}
            </AnimatePresence>
        </section>
    )
}
