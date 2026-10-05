'use client'

import { useEffect, useRef } from 'react'

type Ember = { x: number; y: number; r: number; vy: number; sway: number; phase: number }

// Ki rising off the ground, the way dust and pebbles lift when someone powers up. Embers drift upwards in the hero's
// ki colour (--ki) and shy away from the pointer; while the scouter is charging (--charge) they rush and stretch.
export default function EnergyParticles() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (!canvas || !ctx) return
        const hero = canvas.closest('section')
        const mouse = { x: -999, y: -999 }
        let embers: Ember[] = []
        let frame = 0

        const spawn = (anywhere: boolean): Ember => ({
            x: Math.random() * canvas.width,
            y: anywhere ? Math.random() * canvas.height : canvas.height + 10,
            r: 0.8 + Math.random() * 2.2,
            vy: 0.25 + Math.random() * 0.9,
            sway: 0.15 + Math.random() * 0.5,
            phase: Math.random() * Math.PI * 2,
        })

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            embers = Array.from({ length: 90 }, () => spawn(true))
        }

        const still = matchMedia('(prefers-reduced-motion: reduce)').matches
        const draw = (t: number) => {
            const rush = 1 + 8 * Number(hero?.style.getPropertyValue('--charge') || 0)
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = hero?.style.getPropertyValue('--ki') || '#22c55e'
            for (const e of embers) {
                e.y -= e.vy * rush
                e.x += Math.sin(t / 900 + e.phase) * e.sway
                const dx = e.x - mouse.x, dy = e.y - mouse.y, d = Math.hypot(dx, dy)
                if (d > 0 && d < 110) { e.x += (dx / d) * (110 - d) * 0.06; e.y += (dy / d) * (110 - d) * 0.06 }
                if (e.y < -10) Object.assign(e, spawn(false))
                // Brightest near the ground, fading as it climbs
                const alpha = 0.12 + 0.75 * Math.max(0, e.y / canvas.height)
                // Two faint discs under the core stand in for a glow; a real blur per ember would cost far more
                for (const [spread, fade] of [[4.5, 0.07], [2.3, 0.16]]) {
                    ctx.globalAlpha = alpha * fade
                    ctx.beginPath()
                    ctx.arc(e.x, e.y, e.r * spread, 0, Math.PI * 2)
                    ctx.fill()
                }
                ctx.globalAlpha = alpha
                ctx.beginPath()
                ctx.ellipse(e.x, e.y, e.r, e.r * (1 + (rush - 1) * 0.9), 0, 0, Math.PI * 2)
                ctx.fill()
            }
            if (!still) frame = requestAnimationFrame(draw)
        }

        const onMove = (ev: MouseEvent) => {
            const box = canvas.getBoundingClientRect()
            mouse.x = ev.clientX - box.left
            mouse.y = ev.clientY - box.top
        }

        window.addEventListener('resize', resize)
        window.addEventListener('mousemove', onMove)
        resize()
        frame = requestAnimationFrame(draw)

        return () => {
            window.removeEventListener('resize', resize)
            window.removeEventListener('mousemove', onMove)
            cancelAnimationFrame(frame)
        }
    }, [])

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" aria-hidden />
}
