'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Github, Smartphone, Globe, FileText, Code2, Layers } from 'lucide-react'

export default function Work() {
    const projects = [
        {
            title: 'Visa Sage',
            category: 'Android App',
            description: 'A comprehensive guide and assistant for visa processes. Helps users navigate complex immigration requirements.',
            link: 'https://play.google.com/store/apps/details?id=com.manikarthik.visasage&hl=en_US',
            icon: <Smartphone className="w-6 h-6" />,
            tech: ['Flutter', 'Android', 'Dart']
        },
        {
            title: 'Appian Verse',
            category: 'Community Platform',
            description: 'A dedicated platform for Appian developers to share knowledge, resources, and connect with the community.',
            link: 'https://appianverse.com/',
            icon: <Globe className="w-6 h-6" />,
            tech: ['Appian', 'Community', 'Web']
        },
        {
            title: 'My Resume',
            category: 'Portfolio',
            description: 'This interactive 3D portfolio website built with Next.js and Tailwind CSS to showcase my journey.',
            link: 'https://karthik07m.github.io/my_resume/',
            icon: <FileText className="w-6 h-6" />,
            tech: ['Next.js', 'React', 'Tailwind']
        }
    ]

    return (
        <section className="relative min-h-screen w-full flex items-center justify-center py-20 bg-transparent">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-x-1/2" />
                <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl translate-x-1/2" />
            </div>

            <div className="relative z-20 w-full max-w-[1400px] mx-auto px-6 lg:px-12 flex flex-col items-center">

                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-xl"
                    >
                        <span className="text-sm font-bold tracking-widest uppercase text-blue-400">
                            Portfolio
                        </span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight text-white"
                    >
                        Side <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Projects</span>
                    </motion.h2>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                    {projects.map((project, i) => (
                        <motion.a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -10 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative p-8 rounded-2xl bg-black/40 border border-white/10 hover:border-blue-500/50 hover:bg-black/60 transition-all duration-300 backdrop-blur-md flex flex-col h-full overflow-hidden"
                        >
                            {/* Hover Gradient & Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

                            <div className="relative z-10 flex justify-between items-start mb-6">
                                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                                    {project.icon}
                                </div>
                                <ExternalLink className="w-5 h-5 text-white/30 group-hover:text-blue-400 transition-colors group-hover:rotate-45 duration-300" />
                            </div>

                            <h3 className="relative z-10 text-2xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                                {project.title}
                            </h3>

                            <div className="relative z-10 text-sm font-medium text-purple-400 mb-4 uppercase tracking-wide flex items-center gap-2">
                                <Layers className="w-3 h-3" />
                                {project.category}
                            </div>

                            <p className="relative z-10 text-white/60 mb-6 leading-relaxed flex-grow group-hover:text-white/80 transition-colors">
                                {project.description}
                            </p>

                            <div className="relative z-10 flex flex-wrap gap-2 mt-auto">
                                {project.tech.map((t, j) => (
                                    <span key={j} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/5 text-white/40 border border-white/5 group-hover:border-blue-500/30 group-hover:text-blue-200 group-hover:bg-blue-500/10 transition-all duration-300">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    )
}
