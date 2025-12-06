'use client'

import { motion } from 'framer-motion'
import resume from '@/data/resume.json'

export default function Work() {
    return (
        <section className="relative min-h-screen w-full flex items-center justify-center py-20 bg-transparent">
            <div className="relative z-20 w-full max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col items-center">

                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-xl"
                    >
                        <span className="text-sm font-bold tracking-[0.2em] uppercase text-blue-500">
                            Dungeon Records
                        </span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black tracking-tighter text-white"
                    >
                        SYSTEM <span className="text-blue-500">LOGS</span>
                    </motion.h2>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {resume.work.map((project, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative p-6 rounded-xl bg-black/40 border border-blue-500/30 hover:border-blue-400 hover:bg-blue-900/10 transition-all duration-300 backdrop-blur-md overflow-hidden flex flex-col"
                        >
                            {/* System Window Effect */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-50" />

                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                    {project.title}
                                </h3>
                                <span className="text-[10px] font-mono text-blue-300 bg-blue-900/30 px-2 py-1 rounded border border-blue-500/30">
                                    RANK S
                                </span>
                            </div>

                            <p className="text-sm text-blue-100/70 mb-6 line-clamp-3 flex-grow">
                                {project.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mt-auto">
                                <span className="text-[10px] font-bold px-2 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                    {project.category}
                                </span>
                            </div>

                            {/* Hover Glow */}
                            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
