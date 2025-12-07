'use client'

import Section from '@/components/ui/Section'
import resume from '@/data/resume.json'
import { motion } from 'framer-motion'
import { Database, Code, Cloud, Briefcase, Award, Layers } from 'lucide-react'

export default function About() {
    // Group skills by category for better organization
    const skillCategories = [
        {
            name: 'Appian Development',
            icon: <Layers className="w-5 h-5" />,
            skills: resume.about.skills.filter(s =>
                s.includes('Appian') || s.includes('Process') || s.includes('SAIL') ||
                s.includes('Records') || s.includes('CDTs') || s.includes('Integrations')
            )
        },
        {
            name: 'Database Architecture',
            icon: <Database className="w-5 h-5" />,
            skills: resume.about.skills.filter(s =>
                s.includes('MySQL') || s.includes('SQL Server')
            )
        },
        {
            name: 'Core Development',
            icon: <Code className="w-5 h-5" />,
            skills: resume.about.skills.filter(s =>
                s.includes('Java') || s.includes('Dart') || s.includes('Flutter')
            )
        },
        {
            name: 'Cloud Services',
            icon: <Cloud className="w-5 h-5" />,
            skills: resume.about.skills.filter(s =>
                s.includes('AWS') || s.includes('Firebase')
            )
        }
    ]

    const stats = [
        { label: 'Experience', value: '7+ Years', icon: <Briefcase className="w-6 h-6" /> },
        { label: 'Level', value: 'Senior', icon: <Award className="w-6 h-6" /> }
    ]

    // Animation variants
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <Section id="about" className="relative py-20 overflow-visible">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                {/* Left Column: Title & Skills */}
                <div className="relative z-10 space-y-10">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                            About Me
                        </h2>
                        {/* Vibrant Orange Line */}
                        <div className="h-1 w-24 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full mb-8 shadow-[0_0_25px_rgba(251,146,60,0.8)]" />

                        {/* Skills Categories */}
                        <motion.div
                            variants={container}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            className="space-y-6"
                        >
                            <h3 className="text-xl font-bold text-orange-400 flex items-center gap-3 mb-6 drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]">
                                <span className="animate-pulse text-2xl">⚡</span> Key Skills
                            </h3>

                            <div className="grid grid-cols-1 gap-5">
                                {skillCategories.map((cat) => (
                                    <motion.div
                                        key={cat.name}
                                        variants={item}
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        className="p-5 rounded-xl bg-black/60 border border-orange-500/10 hover:border-orange-400/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.2)] transition-all duration-300 group backdrop-blur-sm"
                                    >
                                        <div className="flex items-center gap-3 mb-4 text-orange-400 group-hover:text-orange-300 transition-colors">
                                            <div className="p-2 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 group-hover:shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all duration-300">
                                                {cat.icon}
                                            </div>
                                            <h4 className="font-bold text-sm uppercase tracking-wider text-white/90 group-hover:text-white group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all">
                                                {cat.name}
                                            </h4>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {cat.skills.map(skill => (
                                                <span
                                                    key={skill}
                                                    className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/5 text-white/70 border border-white/5 group-hover:border-orange-500/30 group-hover:bg-orange-500/10 group-hover:text-orange-200 transition-all duration-300 transform group-hover:translate-x-1"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Right Column: Bio & Stats */}
                <div className="relative z-10 space-y-12">
                    {/* Bio */}
                    <motion.div
                        className="p-8 rounded-2xl bg-black/60 backdrop-blur-xl border border-orange-500/20 shadow-[0_0_30px_rgba(249,115,22,0.1)] relative overflow-hidden group hover:shadow-[0_0_50px_rgba(249,115,22,0.2)] transition-all duration-500"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-orange-400 to-amber-600 shadow-[0_0_20px_rgba(249,115,22,0.6)]" />

                        <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                            <span className="p-2 bg-orange-500/20 rounded-lg text-orange-400 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                                <Briefcase className="w-5 h-5" />
                            </span>
                            Background
                        </h3>
                        <div className="space-y-4 text-white/80 leading-relaxed font-light text-base md:text-lg">
                            {resume.about.summary.map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        variants={container}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid grid-cols-2 gap-6"
                    >
                        {stats.map((stat) => (
                            <motion.div
                                key={stat.label}
                                variants={item}
                                whileHover={{ y: -5, scale: 1.05 }}
                                className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 p-6 rounded-2xl hover:border-orange-500/40 hover:bg-orange-500/5 transition-all duration-300 group shadow-lg hover:shadow-[0_0_30px_rgba(249,115,22,0.2)]"
                            >
                                <div className="text-orange-500 mb-4 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300 drop-shadow-[0_0_10px_rgba(249,115,22,0.6)]">
                                    {stat.icon}
                                </div>
                                <div className="text-3xl font-black text-white font-sans mb-1 group-hover:text-orange-100 group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] transition-all">
                                    {stat.value}
                                </div>
                                <div className="text-xs font-bold uppercase tracking-widest text-white/40 group-hover:text-orange-400 transition-colors">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </Section>
    )
}
