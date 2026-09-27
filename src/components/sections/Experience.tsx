'use client'

import { motion } from 'framer-motion'
import resume from '@/data/resume.json'

export default function Experience() {
    return (
        <section className="relative md:min-h-screen w-full flex items-center justify-center py-12 md:py-20 bg-transparent">
            <div className="relative z-20 w-full max-w-[1000px] mx-auto px-5 sm:px-6 lg:px-12 flex flex-col items-center">

                {/* Header */}
                <div className="text-center mb-10 md:mb-20 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 backdrop-blur-xl"
                    >
                        <span className="text-sm font-bold tracking-[0.2em] uppercase text-red-500">Career Path</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter text-white"
                    >
                        EXPERIENCE <span className="text-red-500">LOG</span>
                    </motion.h2>
                </div>

                {/* Timeline */}
                <div className="relative w-full">
                    {resume.experience.map((job, i) => (
                        <div key={job.company + job.start} className="relative grid grid-cols-[auto_1fr] md:grid-cols-[200px_auto_1fr] gap-3 md:gap-12 group">

                            {/* Left Column: Date */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="hidden md:flex flex-col items-end text-right py-8"
                            >
                                <span className="text-xl md:text-2xl font-bold text-white group-hover:text-red-500 transition-colors">
                                    {job.start.split(' ')[1]}
                                </span>
                                <span className="text-sm font-mono text-white/50 uppercase tracking-widest">
                                    {job.start} – {job.end}
                                </span>
                            </motion.div>

                            {/* Center Column: Line & Node */}
                            <div className="relative flex flex-col items-center">
                                <div className="flex-grow w-px bg-white/10 group-hover:bg-red-500/50 transition-colors duration-500" />
                                <div className="absolute top-8 w-3 h-3 rounded-full bg-black border-2 border-red-500 group-hover:scale-125 transition-transform duration-300 z-10" />
                                <div className="flex-grow w-px bg-white/10 group-hover:bg-red-500/50 transition-colors duration-500" />
                            </div>

                            {/* Right Column: Content */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 + 0.1 }}
                                className="pb-6 md:pb-12 pt-2 md:pt-6"
                            >
                                <div className="relative p-5 md:p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm group-hover:border-red-500/20">

                                    {/* Mobile Date */}
                                    <div className="md:hidden mb-4 text-sm font-mono text-red-400">
                                        {job.start} – {job.end}
                                    </div>

                                    <div className="flex flex-col gap-1 mb-4">
                                        <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-red-500 transition-colors">
                                            {job.company} <span className="text-base font-normal text-white/40">· {job.location}</span>
                                        </h3>
                                        <div className="text-red-400 font-mono text-sm">{job.role}</div>
                                    </div>

                                    {/* Boss fight framing */}
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2 text-sm">
                                        <span className="text-white/30 uppercase tracking-widest text-xs">Boss:</span>
                                        <span className="text-white/80 font-bold">{job.boss.name}</span>
                                        <span className="text-red-400 tracking-[0.15em]" aria-label={`Difficulty ${job.boss.difficulty} of 5`}>
                                            {'★'.repeat(job.boss.difficulty)}<span className="text-white/20">{'★'.repeat(5 - job.boss.difficulty)}</span>
                                        </span>
                                        {job.end === 'Present' ? (
                                            <span className="ml-auto text-[10px] font-black tracking-widest px-2 py-0.5 rounded-sm border border-red-500/60 text-red-400 animate-pulse -rotate-3">
                                                IN PROGRESS
                                            </span>
                                        ) : (
                                            <span className="ml-auto text-[10px] font-black tracking-widest px-2 py-0.5 rounded-sm border-2 border-green-500/70 text-green-400 -rotate-6">
                                                CLEARED
                                            </span>
                                        )}
                                    </div>
                                    {job.client && (
                                        <p className="text-xs text-white/40 mb-4">
                                            <span className="uppercase tracking-widest text-white/30">Quest giver:</span> {job.client}
                                        </p>
                                    )}

                                    <ul className="text-[15px] md:text-base text-white/70 leading-relaxed mb-5 space-y-1.5 list-disc pl-4 md:pl-5 marker:text-red-500/60">
                                        {job.bullets.map((bullet) => (
                                            <li key={bullet}>{bullet}</li>
                                        ))}
                                    </ul>

                                    <div className="flex flex-wrap gap-2">
                                        {job.stack.split(', ').map((tech) => (
                                            <span key={tech} className="text-xs font-bold px-3 py-1 rounded-sm bg-red-500/10 text-red-400 border border-red-500/20">
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
        </section>
    )
}
