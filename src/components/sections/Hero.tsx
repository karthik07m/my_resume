'use client'

import { AnimatePresence, motion, useInView } from 'framer-motion'
import resume from '@/data/resume.json'
import EnergyParticles from '@/components/effects/EnergyParticles'
import dynamic from 'next/dynamic'
import { FORMS } from '@/components/canvas/forms'
import MagneticButton from '@/components/ui/MagneticButton'
import VaporText from '@/components/ui/VaporText'
import Scouter, { SAIYAN } from '@/components/ui/Scouter'
import KiAura from '@/components/effects/KiAura'
import Shenron from '@/components/effects/Shenron'
import { MangaSfx } from '@/components/ui/MangaText'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { sfx } from '@/lib/sfx'
import { useSage } from '@/components/ui/SageMode'
import { useState, useEffect, useRef, useCallback, type CSSProperties } from 'react'

// three.js is over half the page's JavaScript, so the 3D shape loads after the hero is interactive.
const HeroShape = dynamic(() => import('@/components/canvas/CodingShape'), { ssr: false })

const [firstName, lastName] = (() => {
    const parts = resume.name.split(' ')
    return [parts.slice(0, -1).join(' '), parts.at(-1)]
})()

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

const clientCount = new Set(resume.experience.map((j) => j.client).filter(Boolean)).size

// Real numbers, read straight off the timeline.
const STATS = [
    { label: 'Appian yrs', val: '7+' },
    { label: 'Clients', val: `${clientCount}` },
    { label: 'Appian ver.', val: '18→26' },
]

// What colour each form of the 3D shape is drawn in; the text forms take the hero's ki colour.
const FORM_COLOR: Partial<Record<(typeof FORMS)[number], string>> = { 'Dragon Balls': '#fb923c', 'Four-Star Ball': '#fb923c', 'Dragon Radar': '#22c55e', 'Z': '#ef4444' }

export default function Hero() {
    const [typedText, setTypedText] = useState('')
    const fullText = resume.tagline
    const [form, setForm] = useState(0)
    const [taps, setTaps] = useState(0)
    const nextForm = () => { setForm((f) => (f + 1) % FORMS.length); setTaps((n) => n + 1); sfx.whoosh() }
    const dragonBalls = FORMS[form] === 'Dragon Balls'
    // Dragon Ball power-up: holding the scouter climbs SAIYAN one form at a time and recolours the hero through --ki.
    const [level, setLevel] = useState(0)
    const saiyan = SAIYAN[level]
    // Sage Mode recolours the hero in its own orange and gold, whatever form it is in.
    const sageOn = useSage()
    const tone = sageOn ? { ki: '#fb923c', ki2: '#facc15', aura: '#fdba74' } : saiyan
    const [cutIn, setCutIn] = useState(0) // the form whose title band is on screen; only a transformation you watch gets one
    const ascend = () => {
        setLevel(level + 1)
        setCutIn(level + 1)
        sfx.saiyan()
    }
    // A returning visitor has already watched the opening: the hero starts as a Super Saiyan, without the show.
    const skipIntro = useCallback(() => setLevel((l) => l || 1), [])
    // The hero's own mechanic: gather the Dragon Balls, summon Shenron, and his wishes are the résumé's real actions.
    const shapeBox = useRef<HTMLDivElement>(null)
    const [summoned, setSummoned] = useState<{ x: number; y: number } | null>(null) // where on screen he rises from, once summoned
    const summon = () => {
        const box = shapeBox.current!.getBoundingClientRect()
        setForm(FORMS.indexOf('Dragon Balls'))
        setSummoned({ x: box.left + box.width / 2, y: box.top + box.height / 2 })
        sfx.haki()
    }
    // The balls glow gold while Shenron is out
    const shapeColor = dragonBalls && summoned ? '#fde047' : FORM_COLOR[FORMS[form]] ?? tone.ki
    // Phones skip the 2D ember canvas: the 3D hero + star field is enough work for a mobile GPU.
    const isDesktop = useMediaQuery('(min-width: 768px)')
    // Everything animated in the hero pauses once it scrolls away; it was burning CPU under every other section.
    const sectionRef = useRef<HTMLElement>(null)
    const heroVisible = useInView(sectionRef, { margin: '10% 0px' })
    // Written straight to the DOM: the aura and the trembling name follow the gauge every frame without re-rendering the hero.
    const onCharge = (charge: number) => {
        sectionRef.current?.style.setProperty('--charge', `${charge}`)
        sectionRef.current?.toggleAttribute('data-charging', charge > 0)
    }

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
        }, 28)
        return () => clearInterval(timer)
    }, [fullText])

    return (
        <section
            ref={sectionRef}
            style={{ '--ki': tone.ki, '--ki2': tone.ki2, '--aura': tone.aura, '--aura-rest': level || sageOn ? 1 : 0.7 } as CSSProperties}
            className="relative min-h-screen w-full flex items-center overflow-hidden bg-transparent"
        >
            {isDesktop && heroVisible && <EnergyParticles />}

            <div className="relative z-20 w-full max-w-[1400px] mx-auto px-5 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12 items-center h-full pt-20 pb-10 lg:pt-28 lg:pb-12">

                {/* Left Column: Text Content */}
                <div className="flex flex-col items-start space-y-5 lg:space-y-8 pointer-events-auto text-left order-2 lg:order-1 w-full">

                    <VaporText texts={["Appian Developer", "Super Saiyan Developer", "Process Automation", "Instant Transmission Hotfixes", "BPM Expert", "Senzu Bean Bug Fixes"]} className="w-full" />

                    {/* Identity Block */}
                    <div className="space-y-4 flex flex-col items-start">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-zinc-900/80 border border-white/10"
                        >
                            <div className="w-2 h-2 rounded-full animate-pulse bg-(--ki) transition-colors duration-700 shrink-0" />
                            <span className="text-[11px] sm:text-sm font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-(--ki) transition-colors duration-700">
                                {resume.title} / Z Fighter
                            </span>
                        </motion.div>

                        {/* The name stands in a ki aura and trembles while the scouter is charging */}
                        <div className="relative ki-shake">
                        {heroVisible && <KiAura sparks={/Saiyan [23]$/.test(saiyan.name)} />}
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
                                    className="block text-transparent bg-clip-text bg-[linear-gradient(90deg,var(--ki),var(--ki2))]"
                                    initial={{ y: '110%' }}
                                    animate={{ y: 0 }}
                                    transition={{ delay: 0.2 + firstName.length * 0.035, type: 'spring', stiffness: 200, damping: 24 }}
                                >
                                    {lastName}
                                </motion.span>
                            </span>
                        </h1>
                        {/* Goku's signature move, in the blue of the beam against the gold aura */}
                        <MangaSfx jp="かめはめ波!" en="Kamehameha!" color="#7dd3fc" tilt={-8} className="mt-3 md:mt-0 md:absolute md:left-full md:ml-5 md:top-3" />
                        </div>
                    </div>

                    {/* Role / Typing */}
                    <div className="min-h-8 flex items-center justify-start">
                        <p className="text-sm sm:text-base md:text-lg font-light text-white/70 max-w-xl leading-relaxed">
                            {typedText}
                            {/* Blinks in CSS: a timer here used to re-render the whole hero twice a second for the entire visit */}
                            <span className="inline-block w-2 h-4 sm:h-6 ml-2 align-middle bg-(--ki) animate-[blink_1s_steps(1)_infinite]" />
                        </p>
                    </div>

                    {/* Stats Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="w-full py-5 sm:py-6 border-t border-b border-white/10 space-y-4"
                    >
                        <div className="flex flex-wrap justify-start items-center gap-x-6 gap-y-4 sm:gap-x-10">
                            {STATS.map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.8 + i * 0.06, type: 'spring', stiffness: 220, damping: 24 }}
                                    className="flex flex-col gap-1 items-start"
                                >
                                    <div className="text-[10px] text-white/70 uppercase tracking-[0.15em] sm:tracking-[0.2em] leading-tight sm:whitespace-nowrap">{stat.label}</div>
                                    <div className="text-2xl sm:text-3xl font-black tabular-nums text-(--ki) transition-colors duration-700">{stat.val}</div>
                                </motion.div>
                            ))}
                            <Scouter level={level} onCharge={onCharge} onAscend={ascend} onPowerDown={() => setLevel(0)} onSkipIntro={skipIntro} />
                        </div>
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

                {/* Right Column: 3D Object. Tapping the Dragon Balls summons Shenron; tapping any other form moves to the next one */}
                <div ref={shapeBox} style={{ '--shape': shapeColor } as CSSProperties} className="relative w-full h-[290px] sm:h-[400px] lg:h-[800px] flex items-center justify-center order-1 lg:order-2 pointer-events-auto z-30">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
                        <div className="w-48 h-48 sm:w-72 sm:h-72 lg:w-[440px] lg:h-[440px] rounded-full blur-3xl transition-colors duration-700 bg-(--shape)/15" />
                    </div>
                    <HeroShape form={form} color={shapeColor} onTap={dragonBalls ? summon : nextForm} running={heroVisible} />
                    {/* Summon button (while the Dragon Balls are showing) and the form counter */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2 }}
                        className="absolute bottom-1 lg:bottom-24 left-1/2 -translate-x-1/2 flex flex-col sm:flex-row items-center gap-2 whitespace-nowrap"
                    >
                        {dragonBalls && (
                            <button type="button" onClick={summon} className="px-4 py-2 rounded-full bg-orange-500 text-black font-black text-xs tracking-widest uppercase shadow-[0_0_24px_rgba(249,115,22,0.7)] hover:bg-orange-400 transition-colors">
                                🐉 Summon Shenron
                            </button>
                        )}
                        <button type="button" onClick={nextForm} className="px-3 py-1.5 rounded-full bg-black/50 border border-(--shape)/40 text-(--shape) hover:bg-(--shape)/10 backdrop-blur font-mono text-[11px] tracking-widest uppercase transition-colors">
                            {FORMS[form]} · {form + 1}/{FORMS.length}{taps === 0 ? ' · tap to change' : taps >= FORMS.length && ' · all forms unlocked ✦'}
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* Transformation cut-in: a title band flashes across the hero once per new form, then fades on its own */}
            {cutIn > 0 && (
                <motion.div
                    key={cutIn}
                    role="status"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 1, 0] }}
                    transition={{ duration: 2, times: [0, 0.06, 0.7, 1], ease: 'linear' }}
                    className="absolute inset-0 z-40 pointer-events-none flex items-center bg-[radial-gradient(circle,color-mix(in_srgb,var(--aura)_40%,transparent),transparent_70%)]"
                >
                    <div className="w-full px-6 py-5 sm:py-8 text-center bg-black/85 border-y-2 border-(--ki) shadow-[0_0_60px_var(--ki)]">
                        <div className="animate-shake text-4xl sm:text-7xl font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-[linear-gradient(180deg,#fff,var(--ki)_45%,var(--ki2))] [filter:drop-shadow(0_0_22px_var(--ki))]">
                            {SAIYAN[cutIn].name}
                        </div>
                        <div className="mt-2 font-mono text-[10px] sm:text-sm tracking-[0.3em] sm:tracking-[0.4em] uppercase text-white/90">{SAIYAN[cutIn].note}</div>
                    </div>
                </motion.div>
            )}

            <AnimatePresence>
                {summoned && (
                    <Shenron
                        key="shenron"
                        from={summoned}
                        onLeave={() => setSummoned(null)}
                        wishes={[
                            { label: 'I wish to hire him', grant: () => scrollToSection('contact') },
                            { label: 'Show me his missions', grant: () => scrollToSection('experience') },
                            { label: 'Give me his résumé', grant: () => window.open(`${base}/${resume.resumeFile}`, '_blank', 'noopener') },
                        ]}
                    />
                )}
            </AnimatePresence>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-4 pointer-events-auto cursor-pointer z-30 mix-blend-difference"
                onClick={() => scrollToSection('about')}
            >
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/70">Scroll · the Nimbus goes this way</span>
                <div className="w-[1px] h-12 bg-white/20 overflow-hidden">
                    <motion.div
                        className="w-full h-full bg-white"
                        animate={{ y: heroVisible ? [-48, 48] : -48 }}
                        transition={{ duration: 1.5, repeat: heroVisible ? Infinity : 0, ease: "linear" }}
                    />
                </div>
            </motion.div>
        </section>
    )
}
