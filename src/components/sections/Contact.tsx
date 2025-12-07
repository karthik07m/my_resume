'use client'

import { motion } from 'framer-motion'
import { Mail, Linkedin, Github, Send } from 'lucide-react'
import MagneticButton from '@/components/ui/MagneticButton'

export default function Contact() {
    return (
        <section className="relative min-h-screen w-full flex items-center justify-center py-20 overflow-hidden">
            {/* Background Gradient Orbs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse delay-1000" />

            <div className="relative z-20 w-full max-w-4xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-12"
                >
                    {/* Header */}
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-sm font-medium text-white/60 uppercase tracking-widest">
                                Available for opportunities
                            </span>
                        </div>

                        <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
                            Let's <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Connect</span>
                        </h2>

                        <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
                            Whether you have a question, a project idea, or just want to say hello,
                            I'm always open to discussing new opportunities.
                        </p>
                    </div>

                    {/* Contact Actions */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                        <MagneticButton
                            className="group relative px-8 py-4 bg-white text-black font-bold text-lg rounded-full overflow-hidden transition-transform active:scale-95"
                        >
                            <a href="mailto:manikarthik@live.com" className="relative z-10 flex items-center gap-3">
                                <Mail className="w-5 h-5" />
                                <span>manikarthik@live.com</span>
                            </a>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span className="absolute inset-0 z-10 flex items-center justify-center gap-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                <Mail className="w-5 h-5" />
                                <span>Send Email</span>
                            </span>
                        </MagneticButton>

                        <div className="flex gap-4">
                            <a
                                href="https://www.linkedin.com/in/mani-karthik-bollimuntha-b30268b7/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-blue-600 hover:border-blue-500 transition-all duration-300 hover:scale-110 group"
                            >
                                <Linkedin className="w-6 h-6" />
                            </a>
                            <a
                                href="https://github.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-4 rounded-full bg-white/5 border border-white/10 text-white hover:bg-gray-800 hover:border-gray-700 transition-all duration-300 hover:scale-110 group"
                            >
                                <Github className="w-6 h-6" />
                            </a>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="pt-20 border-t border-white/5"
                    >
                        <p className="text-white/30 text-sm">
                            Designed & Built by Mani Karthik
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
