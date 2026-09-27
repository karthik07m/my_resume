'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sfx } from '@/lib/sfx'

const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a']

let on = false
const subs = new Set<() => void>()

// Sage Mode: a site-wide palette shift + faster sphere. Toggled by the Konami code, typing "sage",
// or tapping the hero badge three times (mobile).
export const sage = {
    isOn: () => on,
    toggle() {
        on = !on
        document.documentElement.toggleAttribute('data-sage', on)
        subs.forEach((s) => s())
        sfx.sage()
    },
}

export default function SageMode() {
    const [banner, setBanner] = useState<string | null>(null)

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
        const onChange = () => setBanner(on ? 'SAGE MODE ACTIVATED' : 'SAGE MODE RELEASED')
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
    )
}
