'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sfx } from '@/lib/sfx'

const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a']

let on = false
const subs = new Set<() => void>()

// Sage Mode: the hero, the nav and the stars go orange and gold, a glow of natural energy frames the whole screen,
// and the hero shape spins faster. It never recolours the themed sections below the hero.
// Toggled by the frog button, the switch in About, the Konami code, typing "sage".
export const sage = {
    isOn: () => on,
    toggle() {
        on = !on
        document.documentElement.toggleAttribute('data-sage', on)
        subs.forEach((s) => s())
        sfx.sage()
    },
}

// Whether Sage Mode is on, for anything that wants to show it (Naruto's eyes in the About section).
export const useSage = () => useSyncExternalStore((cb) => { subs.add(cb); return () => { subs.delete(cb) } }, () => on, () => false)

export default function SageMode() {
    const [banner, setBanner] = useState<string | null>(null)
    const [active, setActive] = useState(false)

    useEffect(() => {
        let keys: string[] = []
        const onKey = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
            keys = [...keys, e.key.toLowerCase()].slice(-KONAMI.length)
            const konami = keys.length === KONAMI.length && keys.every((k, i) => k === KONAMI[i])
            if (konami || keys.join('').endsWith('sage')) {
                keys = []
                sage.toggle()
            }
        }
        const onChange = () => { setActive(on); setBanner(on ? 'SAGE MODE ACTIVATED' : 'SAGE MODE RELEASED') }
        window.addEventListener('keydown', onKey)
        subs.add(onChange)
        return () => {
            window.removeEventListener('keydown', onKey)
            subs.delete(onChange)
        }
    }, [])

    useEffect(() => {
        if (!banner) return
        const t = setTimeout(() => setBanner(null), 2200)
        return () => clearTimeout(t)
    }, [banner])

    return (
        <>
        <button
            type="button"
            onClick={() => sage.toggle()}
            aria-pressed={active}
            aria-label={active ? 'Release Sage Mode' : 'Enter Sage Mode'}
            title={active ? 'Release Sage Mode' : 'Sage Mode (or: Konami code, type "sage")'}
            className={`fixed bottom-4 left-[3.75rem] z-[60] w-9 h-9 rounded-full bg-black/70 backdrop-blur border text-base leading-none transition-colors ${active ? 'border-orange-400 shadow-[0_0_14px_rgba(251,146,60,0.8)] bg-orange-500/20' : 'border-orange-500/30 hover:bg-orange-500/10'}`}
        >
            🐸
        </button>
        {/* natural energy at the edges of the screen for as long as Sage Mode is on */}
        <div aria-hidden className={`fixed inset-0 z-[55] pointer-events-none transition-opacity duration-700 shadow-[inset_0_0_140px_rgba(251,146,60,0.45)] ${active ? 'opacity-100' : 'opacity-0'}`} />
        <AnimatePresence>
            {banner && (
                <motion.div
                    key={banner}
                    role="status"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[150] pointer-events-none flex items-center justify-center bg-orange-500/15 backdrop-blur-[2px] px-6"
                >
                    <div className="animate-shake text-center">
                        <div className="text-3xl sm:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-500 drop-shadow-[0_0_30px_rgba(255,153,0,0.6)]">
                            {banner}
                        </div>
                        <div className="mt-3 font-mono text-xs sm:text-sm tracking-[0.4em] uppercase text-orange-200/80">
                            {banner.endsWith('ACTIVATED') ? 'Natural energy gathered' : 'Chakra returned to normal'}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
        </>
    )
}
