'use client'

import { motion } from 'framer-motion'
import { useLenis } from '@/components/SmoothScroll'
import resume from '@/data/resume.json'

const links = [
    { name: 'About', href: '#about' },
    { name: 'Experience', href: '#experience' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact', href: '#contact' },
]

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export default function Navigation() {
    const lenisRef = useLenis()

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault()
        if (lenisRef.current) {
            lenisRef.current.scrollTo(href, { offset: -80 })
        } else {
            document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-max max-w-[calc(100vw-1.5rem)] sage-shift"
        >
            <ul className="flex items-center sm:gap-1 px-1 py-1 sm:px-2 sm:py-2 rounded-full bg-zinc-900/80 backdrop-blur-xl border border-white/10 shadow-lg">
                {links.map((link) => (
                    <li key={link.name}>
                        <a
                            href={link.href}
                            onClick={(e) => handleClick(e, link.href)}
                            className="block px-2.5 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-sm font-medium text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                        >
                            {link.name}
                        </a>
                    </li>
                ))}
                <li>
                    <a
                        href={`${base}/${resume.resumeFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-2.5 sm:px-5 py-2 sm:py-2.5 text-[11px] sm:text-sm font-bold text-black bg-green-500 hover:bg-green-400 transition-colors rounded-full"
                    >
                        Résumé
                    </a>
                </li>
            </ul>
        </motion.nav>
    )
}
