'use client'

import { motion } from 'framer-motion'
import resume from '@/data/resume.json'

export default function Experience() {
    return (
        <section className="relative min-h-screen w-full flex items-center justify-center py-20 bg-transparent">
            <div className="relative z-20 w-full max-w-[1000px] mx-auto px-6 lg:px-12 flex flex-col items-center">

                {/* Header */}
                <div className="text-center mb-20 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 backdrop-blur-xl"
                    >
                        <span className="text-sm font-bold tracking-[0.2em] uppercase text-red-500">
                            Career Path
                        </span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black tracking-tighter text-white"
                    >
                        EXPERIENCE <span className="text-red-500">LOG</span>
                    </motion.h2>
                </div>

                {/* Timeline Container */}
                <div className="relative w-full">
                    <div className="space-y-0">
                        {resume.experience.map((job, i) => (
                            <div key={i} className="relative grid grid-cols-[1fr_auto_1fr] md:grid-cols-[200px_auto_1fr] gap-4 md:gap-12 group">

                                {/* Left Column: Date & Period */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="hidden md:flex flex-col items-end text-right py-8"
                                >
                                    <span className="text-2xl font-bold text-white group-hover:text-red-500 transition-colors">
                                        {job.period.split(' - ')[0].split('/')[1]}
                                    </span>
                                    <span className="text-sm font-mono text-white/50 uppercase tracking-widest">
                                        {job.period}
                                    </span>
                                </motion.div>

                                {/* Center Column: Line & Node */}
                                <div className="relative flex flex-col items-center">
                                    {/* Vertical Line */}
                                    <div className="flex-grow w-px bg-white/10 group-hover:bg-red-500/50 transition-colors duration-500" />

                                    {/* Node */}
                                    <div className="absolute top-8 w-3 h-3 rounded-full bg-black border-2 border-red-500 group-hover:scale-125 transition-transform duration-300 z-10" />

                                    {/* Vertical Line (Bottom) */}
                                    <div className="flex-grow w-px bg-white/10 group-hover:bg-red-500/50 transition-colors duration-500" />
                                </div>

                                {/* Right Column: Content */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 + 0.1 }}
                                    className="pb-12 pt-2 md:pt-6"
                                >
                                    <div className="relative p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm group-hover:border-red-500/20">

                                        {/* Mobile Date (Visible only on mobile) */}
                                        <div className="md:hidden mb-4 flex items-center gap-2 text-sm font-mono text-white/50">
                                            <span className="text-red-400">{job.period}</span>
                                        </div>

                                        <div className="flex flex-col gap-1 mb-4">
                                            <h3 className="text-2xl font-bold text-white group-hover:text-red-500 transition-colors">
                                                {job.company}
                                            </h3>
                                            <div className="text-red-400 font-mono text-sm">
                                                {job.role}
                                            </div>
                                        </div>

                                        <p className="text-white/70 leading-relaxed mb-6">
                                            {job.description}
                                        </p>

                                        <div className="flex flex-wrap gap-2">
                                            {job.skills.map((tech, j) => (
                                                <span key={j} className="text-xs font-bold px-3 py-1 rounded-sm bg-red-500/10 text-red-400 border border-red-500/20">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
