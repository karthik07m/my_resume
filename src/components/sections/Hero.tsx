'use client'

import { motion } from 'framer-motion'
import resume from '@/data/resume.json'
import SpeedLines from '@/components/effects/SpeedLines'
import EnergyParticles from '@/components/effects/EnergyParticles'
import { Canvas } from '@react-three/fiber'
import { CodingShape, FORMS } from '@/components/canvas/CodingShape'
import MagneticButton from '@/components/ui/MagneticButton'
import VaporText from '@/components/ui/VaporText'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { sfx } from '@/lib/sfx'
import { sage } from '@/components/ui/SageMode'
import { useState, useEffect, useRef } from 'react'
import { clsx } from 'clsx'

const [firstName, lastName] = (() => {
    const parts = resume.name.split(' ')
    return [parts.slice(0, -1).join(' '), parts.at(-1)]
})()

const appianYears = Math.floor((Date.now() - new Date('2018-11-01').getTime()) / (365.25 * 24 * 3600 * 1000))
const clientCount = new Set(resume.experience.map((j) => j.client).filter(Boolean)).size

const STATS = [
    { label: 'Chakra', val: '∞' },
    { label: '8 Gates', val: 'OPEN' },
    { label: 'Body Flicker', val: 'S+' },
    { label: 'Ramen', val: '100%' },
    { label: 'Appian yrs', val: `${appianYears}` },
    { label: 'Clients', val: `${clientCount}` },
    { label: 'Bugs slain', val: '9000+' },
    { label: 'Appian ver.', val: '18→26' },
]

export default function Hero() {
    const [typedText, setTypedText] = useState('')
    const fullText = `${resume.title} | Appian Level 2 Certified`
    const [showCursor, setShowCursor] = useState(true)
    const [form, setForm] = useState(0)
    const [taps, setTaps] = useState(0)
    const nextForm = () => { setForm((f) => (f + 1) % FORMS.length); setTaps((n) => n + 1); sfx.whoosh() }
    // Secret: tap the badge three times to toggle Sage Mode (keyboard users can type "sage" or the Konami code).
    const badgeTaps = useRef(0)
    const onBadgeTap = () => {
        badgeTaps.current += 1
        if (badgeTaps.current >= 3) { badgeTaps.current = 0; sage.toggle() }
    }
    // Mangekyō form: the Sharingan tints the whole page red while it is up (see globals.css).
    useEffect(() => { document.documentElement.toggleAttribute('data-mangekyo', FORMS[form] === 'Mangekyō') }, [form])
    // Phones skip the two 2D particle canvases: the 3D hero + star field is enough work for a mobile GPU.
    const isDesktop = useMediaQuery('(min-width: 768px)')

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }

    // Typing animation effect
    useEffect(() => {
        let index = 0
        const timer = setInterval(() => {
            if (index <= fullText.length) {
                setTypedText(fullText.slice(0, index))
                index++
            } else {
                clearInterval(timer)
            }
        }, 50)
        const cursorTimer = setInterval(() => setShowCursor((prev) => !prev), 500)
        return () => {
            clearInterval(timer)
            clearInterval(cursorTimer)
        }
    }, [fullText])

    return (
        <section className="relative min-h-screen w-full flex items-center overflow-hidden bg-transparent">
            {isDesktop && <SpeedLines />}
            {isDesktop && <EnergyParticles />}

            <div className="relative z-20 w-full max-w-[1400px] mx-auto px-5 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12 items-center h-full pt-20 pb-10 lg:pt-0 lg:pb-0">

                {/* Left Column: Text Content */}
                <div className="flex flex-col items-start space-y-5 lg:space-y-8 pointer-events-auto text-left order-2 lg:order-1 w-full">

                    <VaporText texts={["Appian Developer", "Santōryū Engineer", "Sharingan Code Reader", "Process Automation", "Body Flicker Deploys", "BPM Expert", "Code Wizard"]} className="w-full" />

                    {/* Identity Block */}
                    <div className="space-y-4 flex flex-col items-start">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={onBadgeTap}
                            title="Tap three times…"
                            className="inline-flex items-center gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 cursor-pointer select-none"
                        >
                            <div className="w-2 h-2 rounded-full animate-pulse bg-green-500 shrink-0" />
                            <span className="text-[11px] sm:text-sm font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-green-500">
                                {resume.title} / Code Wizard
                            </span>
                        </motion.div>

                        <h1 aria-label={resume.name} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.95] text-white">
                            {/* Anime title card: each letter rises out of a mask */}
                            <span className="block overflow-hidden pb-1" aria-hidden>
                                {[...firstName].map((ch, i) => (
                                    <motion.span
                                        key={i}
                                        className="inline-block"
                                        initial={{ y: '110%', opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.15 + i * 0.035, type: 'spring', stiffness: 260, damping: 22 }}
                                    >
                                        {ch === ' ' ? '\u00A0' : ch}
                                    </motion.span>
                                ))}
                            </span>
                            <span className="block overflow-hidden pb-1" aria-hidden>
                                <motion.span
                                    className="block text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"
                                    initial={{ y: '110%' }}
                                    animate={{ y: 0 }}
                                    transition={{ delay: 0.2 + firstName.length * 0.035, type: 'spring', stiffness: 200, damping: 24 }}
                                >
                                    {lastName}
                                </motion.span>
                            </span>
                        </h1>
                    </div>

                    {/* Role / Typing */}
                    <div className="min-h-8 flex items-center justify-start">
                        <p className="text-sm sm:text-lg md:text-2xl font-light tracking-wider sm:tracking-widest text-white/70 uppercase">
                            {typedText}
                            <span className={clsx("inline-block w-2 h-4 sm:h-6 ml-2 align-middle bg-green-500", showCursor ? 'opacity-100' : 'opacity-0')} />
                        </p>
                    </div>

                    {/* Stats Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="grid grid-cols-4 sm:flex sm:flex-wrap justify-start gap-3 sm:gap-8 md:gap-12 py-5 sm:py-6 border-t border-b border-white/10 w-full"
                    >
                        {STATS.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 + i * 0.06, type: 'spring', stiffness: 220, damping: 24 }}
                                className="flex flex-col gap-1 items-start"
                            >
                                <div className="text-[10px] text-white/40 uppercase tracking-[0.15em] sm:tracking-[0.2em] whitespace-nowrap">{stat.label}</div>
                                <div className="text-xl sm:text-2xl md:text-3xl font-black tabular-nums text-green-500">{stat.val}</div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 w-full sm:w-auto">
                        <MagneticButton
                            onClick={() => scrollToSection('experience')}
                            className="w-full sm:w-auto px-10 py-4 bg-white text-black font-bold text-sm tracking-widest hover:bg-gray-200 transition-colors"
                        >
                            MISSION LOG
                        </MagneticButton>
                        <MagneticButton
                            onClick={() => scrollToSection('contact')}
                            className="w-full sm:w-auto px-10 py-4 bg-transparent text-white border border-white/30 font-bold text-sm tracking-widest hover:bg-white/10 transition-colors"
                        >
                            ESTABLISH LINK
                        </MagneticButton>
                    </div>
                </div>

                {/* Right Column: 3D Object (click it: Appian -> Shuriken -> Mangekyō -> Santōryū -> MK) */}
                <div className="relative w-full h-[240px] sm:h-[400px] lg:h-[800px] flex items-center justify-center order-1 lg:order-2 pointer-events-auto z-30">
                    <Canvas camera={{ position: [0, 0, 6] }} dpr={[1, 1.5]}>
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[10, 10, 5]} intensity={1} />
                        <CodingShape form={form} onTap={nextForm} />
                    </Canvas>
                    {/* Transform hint / form counter */}
                    <motion.button
                        type="button"
                        onClick={nextForm}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2 }}
                        className="absolute bottom-2 lg:bottom-24 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/50 border border-green-500/30 backdrop-blur font-mono text-[11px] tracking-widest uppercase text-green-400 hover:bg-green-500/10 transition-colors whitespace-nowrap"
                    >
                        {taps === 0 ? (
                            <span className="animate-pulse">Tap to transform</span>
                        ) : (
                            <>{FORMS[form]}{FORMS[form] === 'Mangekyō' && ' · Sharingan active'} · {form + 1}/{FORMS.length}{taps >= FORMS.length && ' · all forms unlocked ✦'}</>
                        )}
                    </motion.button>
                </div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-4 pointer-events-auto cursor-pointer z-30 mix-blend-difference"
                onClick={() => scrollToSection('about')}
            >
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">Scroll · not that way, Zoro</span>
                <div className="w-[1px] h-12 bg-white/20 overflow-hidden">
                    <motion.div
                        className="w-full h-full bg-white"
                        animate={{ y: [-48, 48] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                </div>
            </motion.div>
        </section>
    )
}
