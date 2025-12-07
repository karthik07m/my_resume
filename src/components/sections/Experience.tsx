'use client'

import { motion, useScroll, useTransform, useMotionTemplate, useMotionValue } from 'framer-motion'
import resume from '@/data/resume.json'
import { useRef, MouseEvent } from 'react'
import { Briefcase, Calendar, MapPin, Building2 } from 'lucide-react'

export default function Experience() {
    const containerRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    })

    const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1])

    return (
        <section ref={containerRef} className="relative min-h-screen w-full flex items-center justify-center py-20 px-6">
            <div className="relative z-20 w-full max-w-7xl mx-auto">

                {/* Header */}
                <div className="text-center mb-24">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-4"
                    >
                        Professional <span className="text-red-500">Experience</span>
                    </motion.h2>
                    <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        className="h-1 w-24 bg-red-500 mx-auto rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                    />
                </div>

                {/* Central Timeline Line */}
                <div className="absolute left-0 md:left-1/2 top-32 bottom-0 w-0.5 bg-white/10 md:-translate-x-1/2 hidden md:block">
                    <motion.div
                        style={{ scaleY, originY: 0 }}
                        className="absolute top-0 w-full h-full bg-gradient-to-b from-red-500 via-red-400 to-red-900 origin-top"
                    />
                </div>

                <div className="flex flex-col gap-12 md:gap-24">
                    {resume.experience.map((job, i) => (
                        <ExperienceCard key={i} job={job} index={i} />
                    ))}
                </div>
            </div>
        </section>
    )
}

function ExperienceCard({ job, index }: { job: any, index: number }) {
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const isEven = index % 2 === 0

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect()
        mouseX.set(clientX - left)
        mouseY.set(clientY - top)
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: isEven ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className={`relative flex items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} flex-col gap-8 md:gap-0`}
        >
            {/* Timeline Dot (Center) */}
            <div className="absolute left-0 md:left-1/2 w-4 h-4 -translate-x-2 md:-translate-x-1/2 rounded-full bg-black border-2 border-red-500 z-30 shadow-[0_0_15px_rgba(239,68,68,0.6)] hidden md:block">
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20" />
            </div>

            {/* Content Spacer for Alignment */}
            <div className="hidden md:block w-1/2" />

            {/* Content Card */}
            <div className={`w-full md:w-1/2 ${isEven ? 'md:pr-12' : 'md:pl-12'}`}>
                <div
                    className="group relative rounded-2xl border border-white/10 bg-white/5 p-8 transition-colors hover:border-red-500/30 overflow-hidden"
                    onMouseMove={handleMouseMove}
                >
                    <div className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
                        style={{
                            backgroundImage: useMotionTemplate`
                                radial-gradient(
                                    650px circle at ${mouseX}px ${mouseY}px,
                                    rgba(239, 68, 68, 0.15),
                                    transparent 80%
                                )
                            ` as any
                        }}
                    />

                    <div className="relative z-10">
                        {/* Header Info */}
                        <div className="flex flex-col gap-4 mb-6">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-white group-hover:text-red-400 transition-colors mb-1">
                                        {job.role}
                                    </h3>
                                    <div className="flex items-center gap-2 text-white/60 font-medium">
                                        <Building2 className="w-4 h-4 text-red-500" />
                                        <span className="uppercase tracking-wider text-sm">{job.company}</span>
                                    </div>
                                </div>

                                <span className="text-xs font-mono py-1.5 px-3 rounded-md bg-red-500/10 text-red-300 border border-red-500/20 flex items-center gap-2 shadow-sm whitespace-nowrap">
                                    <Calendar className="w-3 h-3" />
                                    {job.period}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-white/40">
                                <MapPin className="w-3 h-3" />
                                {job.location}
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-white/70 text-base leading-relaxed mb-8 font-light">
                            {job.description}
                        </p>

                        {/* Skills Tags */}
                        <div className="flex flex-wrap gap-2">
                            {job.skills.map((skill: string) => (
                                <span
                                    key={skill}
                                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/5 text-white/60 border border-white/10 group-hover:border-red-500/30 group-hover:text-red-200 group-hover:bg-red-500/5 transition-all duration-300 shadow-sm"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
