'use client'

import Section from '@/components/ui/Section'
import resume from '@/data/resume.json'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function About() {
    // Group skills by category for better organization
    const skillCategories = [
        {
            name: 'The Heavy Artillery (Appian)',
            icon: '📜',
            skills: resume.about.skills.filter(s =>
                s.includes('Appian') || s.includes('Process') || s.includes('SAIL') ||
                s.includes('Records') || s.includes('CDTs') || s.includes('Integrations')
            )
        },
        {
            name: 'Data Vaults (Databases)',
            icon: '🔒',
            skills: resume.about.skills.filter(s =>
                s.includes('MySQL') || s.includes('SQL Server')
            )
        },
        {
            name: 'Code Combat (Development)',
            icon: '👊',
            skills: resume.about.skills.filter(s =>
                s.includes('Java') || s.includes('Dart') || s.includes('Flutter')
            )
        },
        {
            name: 'Sage Mode (Cloud)',
            icon: '☁️',
            skills: resume.about.skills.filter(s =>
                s.includes('AWS') || s.includes('Firebase')
            )
        }
    ]

    const stats = [
        { label: 'Experience', value: '7+ Years', icon: '📅' },
        { label: 'Level', value: 'Senior', icon: '🥋' },
        { label: 'Projects Delivered', value: '15+', icon: '📜' },
        { label: 'Tech Stack', value: `${resume.about.skills.length}+`, icon: '⚡' }
    ]

    return (
        <Section id="about" className="relative py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Left Column: Title & 3D Model Space */}
                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500 drop-shadow-lg">
                            THE CODE I LIVE BY
                        </h2>
                        <div className="h-1 w-32 bg-orange-500 rounded-full mb-8" />

                        {/* Stats - Vertical List on Left */}
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
                                    <div className="text-2xl font-bold text-white font-mono">
                                        {stat.value}
                                    </div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-white/50">
                                        {stat.label}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Content */}
                <div className="relative z-10 space-y-8">
                    {/* Mission Report (Bio) */}
                    <motion.div
                        className="bg-black/60 backdrop-blur-xl border border-orange-500/30 p-8 rounded-2xl shadow-2xl relative overflow-hidden group"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl group-hover:bg-orange-500/30 transition-colors" />

                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-white">
                            <span className="text-3xl">👨‍💻</span> Professional Bio
                        </h3>
                        <div className="space-y-4 text-lg text-white/80 leading-relaxed">
                            {resume.about.summary.map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                    </motion.div>

                    {/* Skills - Tag Cloud Style */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h3 className="text-xl font-bold mb-4 text-orange-400 flex items-center gap-2">
                            <span className="animate-spin-slow">⚡</span> Skills & Superpowers
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {skillCategories.flatMap(cat => cat.skills).map((skill, i) => (
                                <motion.span
                                    key={skill}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-medium text-white/70 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all cursor-default"
                                >
                                    {skill}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </Section>
    )
}

