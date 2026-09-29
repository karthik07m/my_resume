'use client'

import { cn } from '@/utils/cn'

interface SectionProps {
    children: React.ReactNode
    className?: string
    id?: string
}

export default function Section({ children, className, id }: SectionProps) {
    return (
        <section
            id={id}
            className={cn("md:min-h-screen w-full py-12 md:py-24 px-5 sm:px-6 md:px-12 lg:px-24 max-w-screen-2xl mx-auto flex flex-col justify-center", className)}
        >
            {children}
        </section>
    )
}
