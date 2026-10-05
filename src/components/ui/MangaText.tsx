'use client'

import { motion } from 'framer-motion'
import { clsx } from 'clsx'

// Anime title-card lettering: a giant outlined kanji column behind a section heading. Decorative only.
export function KanjiWatermark({ text, color, className }: { text: string; color: string; className?: string }) {
    return (
        <span
            aria-hidden
            className={clsx('pointer-events-none select-none absolute -z-10 whitespace-nowrap font-black leading-none [writing-mode:vertical-rl] text-transparent text-[4.5rem] md:text-[8rem] opacity-25 md:opacity-30', className)}
            style={{ WebkitTextStroke: `1.5px ${color}` }}
        >
            {text}
        </span>
    )
}

// A manga sound effect stamped beside a heading: the franchise's own line in Japanese, an English gloss under it.
// Pops in once when it scrolls into view; no loop.
export function MangaSfx({ jp, en, color, tilt = -8, className }: { jp: string; en: string; color: string; tilt?: number; className?: string }) {
    return (
        <motion.span
            initial={{ scale: 2.2, opacity: 0, rotate: tilt - 14 }}
            whileInView={{ scale: 1, opacity: 1, rotate: tilt }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 380, damping: 16, delay: 0.5 }}
            className={clsx('pointer-events-none select-none flex w-max flex-col items-center leading-none', className)}
        >
            <span lang="ja" className="whitespace-nowrap text-2xl md:text-4xl font-black italic [-webkit-text-stroke:2px_#000] [paint-order:stroke_fill] drop-shadow-[3px_3px_0_#000]" style={{ color }}>
                {jp}
            </span>
            <span className="mt-1.5 whitespace-nowrap rounded-sm bg-black/85 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white">{en}</span>
        </motion.span>
    )
}
