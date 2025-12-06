'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { cn } from '@/utils/cn'

interface SectionProps {
    children: React.ReactNode
    className?: string
    id?: string
}

export default function Section({ children, className, id }: SectionProps) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-10%" })

    return (
        <motion.section
            id={id}
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className={cn("min-h-screen w-full py-24 px-6 md:px-12 lg:px-24 max-w-screen-2xl mx-auto flex flex-col justify-center", className)}
        >
            {children}
        </motion.section>
    )
}
