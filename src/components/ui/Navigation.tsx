'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useLenis } from '@/components/SmoothScroll'
import resume from '@/data/resume.json'
import { setView } from '@/lib/view'

// Each link wears its section's colour (About orange, Experience red, Projects violet, Contact pink)
// and its Japanese name above the English one. The section you are reading lights up.
const links = [
    { name: 'About', jp: '自己紹介', href: '#about', color: '#fb923c' },
    { name: 'Experience', jp: '経歴', href: '#experience', color: '#f87171' },
    { name: 'Projects', jp: '作品', href: '#projects', color: '#a78bfa' },
    { name: 'Contact', jp: '連絡', href: '#contact', color: '#f472b6' },
]

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

// Which section sits across the middle of the screen. An observer, not a scroll handler, so it costs nothing per frame.
function useActiveSection() {
    const [active, setActive] = useState<string | null>(null)
    useEffect(() => {
        const io = new IntersectionObserver(
            (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(`#${e.target.id}`) }),
            { rootMargin: '-45% 0px -50% 0px' },
        )
        for (const id of ['hero', ...links.map((l) => l.href.slice(1))]) {
            const el = document.getElementById(id)
            if (el) io.observe(el)
        }
        return () => io.disconnect()
    }, [])
    return active
}

export default function Navigation() {
    const lenisRef = useLenis()
    const reducedMotion = useReducedMotion()
    const active = useActiveSection()

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault()
        if (lenisRef.current) {
            // Lenis already accounts for html's scroll-padding-top.
            lenisRef.current.scrollTo(href, { immediate: !!reducedMotion })
        } else {
            document.querySelector(href)?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth' })
        }
    }

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-50 w-max max-w-[calc(100vw-1rem)] sage-shift"
            aria-label="Sections"
        >
            <ul className="flex items-stretch gap-0.5 p-1 sm:p-1.5 rounded-xl bg-black/75 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]">
                {links.map((link) => {
                    const on = active === link.href
                    return (
                        <li key={link.name}>
                            <a
                                href={link.href}
                                onClick={(e) => handleClick(e, link.href)}
                                aria-current={on ? 'true' : undefined}
                                style={{ '--c': link.color } as React.CSSProperties}
                                className={`group relative flex flex-col items-center justify-center h-full px-2 sm:px-4 py-1.5 sm:py-1 rounded-lg transition-colors ${on ? 'bg-[color-mix(in_srgb,var(--c)_14%,transparent)]' : 'hover:bg-white/[0.06]'}`}
                            >
                                <span className={`hidden sm:block text-[10px] leading-none tracking-[0.25em] transition-colors ${on ? 'text-[var(--c)]' : 'text-zinc-500 group-hover:text-[var(--c)]'}`} aria-hidden>
                                    {link.jp}
                                </span>
                                <span className={`text-[11px] sm:text-sm sm:mt-1 font-medium transition-colors ${on ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`}>
                                    {link.name}
                                </span>
                                {/* A short stroke of the section's colour under the one you are on. */}
                                <span
                                    className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-[var(--c)] shadow-[0_0_8px_var(--c)] transition-all duration-300 ${on ? 'w-6 opacity-100' : 'w-0 opacity-0'}`}
                                    aria-hidden
                                />
                            </a>
                        </li>
                    )
                })}

                <li className="mx-1 sm:mx-1.5 my-1.5 w-px bg-white/10" aria-hidden />

                <li className="flex items-center">
                    <a
                        href={`${base}/${resume.resumeFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mx-0.5 sm:mx-1 px-2.5 sm:px-4 py-1.5 sm:py-2 -skew-x-12 bg-green-500 hover:bg-green-400 text-black shadow-[3px_3px_0_rgba(34,197,94,0.35)] hover:shadow-[4px_4px_0_rgba(34,197,94,0.5)] transition-all"
                    >
                        <span className="inline-block skew-x-12 text-[11px] sm:text-sm font-bold">Résumé ↓</span>
                    </a>
                </li>
                <li>
                    <button
                        type="button"
                        onClick={() => setView('pro')}
                        title="Switch to the plain version of this résumé"
                        className="group flex flex-col items-center justify-center h-full px-2 sm:px-3 py-1.5 sm:py-1 rounded-lg hover:bg-white/[0.06] transition-colors"
                    >
                        <span className="hidden sm:block text-[10px] leading-none tracking-[0.25em] text-zinc-500 group-hover:text-[#e0553d] transition-colors" aria-hidden>普通版</span>
                        <span className="text-[11px] sm:text-sm sm:mt-1 font-medium text-zinc-400 group-hover:text-white transition-colors">Plain</span>
                    </button>
                </li>
            </ul>
        </motion.nav>
    )
}
