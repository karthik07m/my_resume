'use client'

import { motion } from 'framer-motion'
import { useLenis } from '@/components/SmoothScroll'

const links = [
    { name: 'About', href: '#about' },
    { name: 'Experience', href: '#experience' },
    { name: 'Work', href: '#work' },
    { name: 'Contact', href: '#contact' },
]

export default function Navigation() {
    const lenis = useLenis()

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault()
        if (lenis) {
            lenis.scrollTo(href)
        } else {
            const element = document.querySelector(href)
            element?.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
        >
            <ul className="flex items-center gap-1 px-2 py-2 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg ring-1 ring-black/5">
                {links.map((link) => (
                    <li key={link.name}>
                        <a
                            href={link.href}
                            onClick={(e) => handleClick(e, link.href)}
                            className="block px-5 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                        >
                            {link.name}
                        </a>
                    </li>
                ))}
            </ul>
        </motion.nav>
    )
}
