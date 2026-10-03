'use client'

import { motion } from 'framer-motion'
import resume from '@/data/resume.json'

// Solo Leveling: every shipped project is a shadow extracted into the army, in resume.json order.
const SHADOWS = [
    { name: 'Igris', lore: 'The first knight to kneel. Still on duty years later.' },
    { name: 'Beru', lore: 'The Ant King: evolved fast by feeding on everything it met.' },
    { name: 'Iron', lore: 'The shield bearer. Nothing gets past it, data included.' },
    { name: 'Kaisel', lore: 'The flying mount, always hovering at your side, like DOT.' },
]

export default function Projects() {
    return (
        <section className="relative md:min-h-screen w-full flex items-center justify-center py-12 md:py-20 bg-transparent">
            <div className="relative z-20 w-full max-w-[1400px] mx-auto px-5 sm:px-6 lg:px-12 flex flex-col items-center">

                {/* Header */}
                <div className="text-center mb-10 md:mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-xl"
                    >
                        <span className="text-sm font-bold tracking-[0.2em] uppercase text-blue-500">Dungeon Records</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter text-white"
                    >
                        SYSTEM <span className="text-blue-500">LOGS</span>
                    </motion.h2>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                    {resume.projects.map((project, i) => (
                        <motion.a
                            key={project.name}
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 28, scale: 0.96 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            whileHover={{ y: -6 }}
                            viewport={{ once: true, margin: '-10%' }}
                            transition={{ delay: i * 0.08, type: 'spring', stiffness: 220, damping: 24 }}
                            className="group relative p-6 rounded-xl bg-black/60 border border-blue-500/30 hover:border-blue-400 hover:bg-blue-900/10 transition-all duration-300 overflow-hidden flex flex-col"
                        >
                            {/* System Window Effect: top bar + corner brackets */}
                            {['top-1 left-1 border-t-2 border-l-2', 'top-1 right-1 border-t-2 border-r-2', 'bottom-1 left-1 border-b-2 border-l-2', 'bottom-1 right-1 border-b-2 border-r-2'].map((c) => (
                                <span key={c} aria-hidden className={`absolute w-3 h-3 border-blue-400/80 ${c}`} />
                            ))}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-50" />

                            <div className="flex justify-between items-start mb-1">
                                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                    {project.name}
                                </h3>
                                <span title={SHADOWS[i]?.lore} className="shrink-0 text-[10px] font-mono uppercase text-violet-300 bg-violet-900/30 px-2 py-1 rounded border border-violet-500/30">
                                    {SHADOWS[i] ? `Shadow · ${SHADOWS[i].name}` : 'Hunter'}{project.year && ` · ${project.year}`}
                                </span>
                            </div>
                            <p className="text-xs font-mono text-blue-300/60 mb-4">{project.kind}</p>
                            {SHADOWS[i] && <p className="-mt-3 mb-4 text-[11px] italic text-violet-300/60">{SHADOWS[i].lore}</p>}

                            <p className="text-sm text-blue-100/70 mb-6 flex-grow">{project.description}</p>

                            <div className="flex items-center justify-between mt-auto">
                                <span className="text-[10px] font-black px-2 py-1 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20 uppercase tracking-[0.3em] transition-shadow group-hover:shadow-[0_0_14px_rgba(139,92,246,0.7)]">
                                    Arise
                                </span>
                                <span className="text-sm text-blue-400 group-hover:underline">{project.linkLabel} ↗</span>
                            </div>

                            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    )
}
