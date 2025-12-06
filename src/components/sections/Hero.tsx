'use client'

import { motion } from 'framer-motion'
import resume from '@/data/resume.json'
import CursorTrail from '@/components/effects/CursorTrail'
import SpeedLines from '@/components/effects/SpeedLines'
import EnergyParticles from '@/components/effects/EnergyParticles'
import { Canvas } from '@react-three/fiber'
import { CodingShape } from '@/components/canvas/CodingShape'
import MagneticButton from '@/components/ui/MagneticButton'
import { useState, useEffect } from 'react'
import { clsx } from 'clsx'

export default function Hero() {
    const [typedText, setTypedText] = useState('')
    const fullText = resume.hero.title
    const [showCursor, setShowCursor] = useState(true)

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id)
        element?.scrollIntoView({ behavior: 'smooth' })
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

        const cursorTimer = setInterval(() => {
            setShowCursor(prev => !prev)
        }, 500)

        return () => {
            clearInterval(timer)
            clearInterval(cursorTimer)
        }
    }, [fullText])

    return (
        <section className="relative min-h-screen w-full flex items-center overflow-hidden bg-transparent">
            {/* Background Effects */}
            <SpeedLines />
            <EnergyParticles />



            {/* Main Content Grid */}
            <div className="relative z-20 w-full max-w-[1400px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full pt-20 lg:pt-0">

                {/* Left Column: Text Content */}
                <div className="flex flex-col items-start space-y-8 pointer-events-auto text-left order-2 lg:order-1">

                    {/* Identity Block */}
                    <div className="space-y-4 flex flex-col items-start">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-orange-500/20"
                        >
                            <div className="w-2 h-2 rounded-full animate-pulse bg-green-500" />
                            <span className="text-sm font-bold tracking-[0.3em] uppercase text-green-500">
                                Senior Appian Developer / Code Wizard
                            </span>
                        </motion.div>

                        <div className="relative">
                            <motion.h1
                                className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white mix-blend-overlay opacity-90"
                            >
                                {resume.hero.name}
                            </motion.h1>
                            <motion.h1
                                className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"
                            >
                                {resume.hero.surname}
                            </motion.h1>
                        </div>
                    </div>

                    {/* Role / Typing */}
                    <div className="h-8 flex items-center justify-start">
                        <p className="text-xl md:text-2xl font-light tracking-widest text-white/70 uppercase">
                            {typedText}
                            <span className={clsx("inline-block w-2 h-6 ml-2 align-middle animate-pulse bg-green-500", showCursor ? 'opacity-100' : 'opacity-0')} />
                        </p>
                    </div>

                    {/* Stats Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap justify-start gap-8 md:gap-12 py-6 border-t border-b border-white/10 w-full"
                    >
                        {[
                            { label: 'Chakra', val: '∞' },
                            { label: 'Willpower', val: 'MAX' },
                            { label: 'Speed', val: 'S+' },
                            { label: 'Ramen', val: '100%' }
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col gap-1 items-start">
                                <div className="text-[10px] text-white/40 uppercase tracking-[0.2em]">{stat.label}</div>
                                <div className="text-2xl md:text-3xl font-black tabular-nums text-green-500">{stat.val}</div>
                            </div>
                        ))}
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div className="flex flex-col sm:flex-row gap-6">
                        <MagneticButton
                            onClick={() => scrollToSection('experience')}
                            className="px-10 py-4 bg-white text-black font-bold text-sm tracking-widest hover:bg-gray-200 transition-colors"
                        >
                            MISSION LOG
                        </MagneticButton>

                        <MagneticButton
                            onClick={() => scrollToSection('contact')}
                            className="px-10 py-4 bg-transparent text-white border border-white/30 font-bold text-sm tracking-widest hover:bg-white/10 transition-colors"
                        >
                            ESTABLISH LINK
                        </MagneticButton>
                    </motion.div>
                </div>

                {/* Right Column: 3D Object */}
                <div className="relative w-full h-[500px] lg:h-[800px] flex items-center justify-center order-1 lg:order-2 pointer-events-auto z-30">
                    <Canvas camera={{ position: [0, 0, 6] }}>
                        <ambientLight intensity={0.5} />
                        <directionalLight position={[10, 10, 5]} intensity={1} />
                        <CodingShape />
                    </Canvas>
                </div>

            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 pointer-events-auto cursor-pointer z-30 mix-blend-difference"
                onClick={() => scrollToSection('about')}
            >
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">Scroll</span>
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

