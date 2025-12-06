'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import MagneticButton from '@/components/ui/MagneticButton'

export default function Contact() {
    const [particles, setParticles] = useState<{ top: string; left: string; delay: string; opacity: number }[]>([])

    useEffect(() => {
        const newParticles = Array.from({ length: 20 }).map(() => ({
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 2}s`,
            opacity: Math.random() * 0.5
        }))
        setParticles(newParticles)
    }, [])

    return (
        <section className="relative min-h-screen w-full flex items-center justify-center py-20 bg-transparent">
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
                        <h2 className="relative text-6xl md:text-8xl font-black tracking-tighter text-white mb-2">
                            BREATH OF <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">CODE</span>
                        </h2>
                        <p className="text-xl text-white/60 font-mono tracking-widest uppercase">
                            First Form: Contact
                        </p>
                    </div>

                    <p className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto leading-relaxed">
                        Ready to slay some bugs or build the next big thing?
                        Send a crow my way.
                    </p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8">
                        <MagneticButton
                            className="px-12 py-5 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-lg tracking-widest hover:brightness-110 transition-all shadow-lg shadow-pink-500/25"
                        >
                            SEND KASUGAI CROW
                        </MagneticButton>

                        <div className="flex gap-6 text-white/50">
                            {['GitHub', 'LinkedIn', 'Twitter'].map((social) => (
                                <a
                                    key={social}
                                    href="#"
                                    className="hover:text-pink-400 transition-colors uppercase text-sm tracking-widest font-bold"
                                >
                                    {social}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Decorative Particles (Simulated with CSS) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none overflow-hidden">
                        {particles.map((p, i) => (
                            <div
                                key={i}
                                className="absolute w-1 h-1 bg-pink-500 rounded-full animate-pulse"
                                style={{
                                    top: p.top,
                                    left: p.left,
                                    animationDelay: p.delay,
                                    opacity: p.opacity
                                }}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
