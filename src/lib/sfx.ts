'use client'

import { useSyncExternalStore } from 'react'

// Tiny Web Audio sound effects. Off by default; the user opts in with the toggle.
const KEY = 'sfx-on'
let enabled: boolean | null = null
let ctx: AudioContext | null = null
const subs = new Set<() => void>()

const isOn = () => {
    if (enabled === null) {
        try { enabled = localStorage.getItem(KEY) === '1' } catch { enabled = false }
    }
    return enabled
}

const audio = () => {
    if (!ctx) ctx = new AudioContext()
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
}

type ToneOpts = { type?: OscillatorType; to?: number; gain?: number; delay?: number }

function tone(freq: number, dur: number, opts: ToneOpts = {}) {
    if (!isOn()) return
    try {
        const ac = audio()
        const t0 = ac.currentTime + (opts.delay ?? 0)
        const osc = ac.createOscillator()
        const g = ac.createGain()
        osc.type = opts.type ?? 'sine'
        osc.frequency.setValueAtTime(freq, t0)
        if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, t0 + dur)
        g.gain.setValueAtTime(0.0001, t0)
        g.gain.exponentialRampToValueAtTime(opts.gain ?? 0.08, t0 + 0.01)
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
        osc.connect(g).connect(ac.destination)
        osc.start(t0)
        osc.stop(t0 + dur + 0.05)
    } catch { /* no audio available */ }
}

export const sfx = {
    hover: () => tone(880, 0.05, { type: 'square', gain: 0.025 }),
    click: () => tone(660, 0.08, { type: 'triangle', to: 990 }),
    pop: () => tone(300, 0.12, { type: 'square', to: 900, gain: 0.06 }),
    whoosh: () => tone(900, 0.35, { type: 'sawtooth', to: 120, gain: 0.05 }),
    levelUp: () => {
        tone(523, 0.12, { type: 'triangle' })
        tone(784, 0.12, { type: 'triangle', delay: 0.12 })
        tone(1047, 0.25, { type: 'triangle', delay: 0.24 })
    },
    sage: () => {
        tone(110, 0.6, { type: 'sawtooth', to: 440, gain: 0.07 })
        tone(220, 0.6, { type: 'square', to: 880, gain: 0.04, delay: 0.1 })
    },
    haki: () => {
        tone(70, 1.2, { type: 'sawtooth', to: 30, gain: 0.1 })
        tone(140, 0.8, { type: 'square', to: 50, gain: 0.05, delay: 0.05 })
    },
    saiyan: () => {
        tone(90, 0.9, { type: 'sawtooth', to: 700, gain: 0.08 })
        tone(1400, 0.5, { type: 'square', to: 2100, gain: 0.03, delay: 0.5 })
    },
    toggle() {
        enabled = !isOn()
        try { localStorage.setItem(KEY, enabled ? '1' : '0') } catch { /* private mode */ }
        subs.forEach((s) => s())
        if (enabled) sfx.click()
    },
}

export const useSfxEnabled = () =>
    useSyncExternalStore(
        (cb) => { subs.add(cb); return () => { subs.delete(cb) } },
        isOn,
        () => false,
    )
