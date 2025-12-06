'use client'

import { useEffect, useRef } from 'react'

export default function SpeedLines() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number
        let lines: { x: number; y: number; length: number; speed: number; width: number }[] = []

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            initLines()
        }

        const initLines = () => {
            lines = []
            const centerX = canvas.width / 2
            const centerY = canvas.height / 2
            const count = 40

            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2
                const distance = Math.random() * (Math.max(canvas.width, canvas.height) / 2) + 100
                lines.push({
                    x: centerX + Math.cos(angle) * distance,
                    y: centerY + Math.sin(angle) * distance,
                    length: Math.random() * 100 + 50,
                    speed: Math.random() * 10 + 5,
                    width: Math.random() * 2 + 0.5
                })
            }
        }

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)' // Trail effect
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            const centerX = canvas.width / 2
            const centerY = canvas.height / 2

            ctx.strokeStyle = 'rgba(34, 197, 94, 0.2)' // Green-500 with low opacity
            ctx.lineCap = 'round'

            lines.forEach(line => {
                const dx = line.x - centerX
                const dy = line.y - centerY
                const angle = Math.atan2(dy, dx)

                // Move line towards center (or away for different effect)
                // Here we move them away from center to simulate forward movement
                line.x += Math.cos(angle) * line.speed
                line.y += Math.sin(angle) * line.speed

                // Reset if out of bounds
                const dist = Math.sqrt(dx * dx + dy * dy)
                if (dist > Math.max(canvas.width, canvas.height)) {
                    const newAngle = Math.random() * Math.PI * 2
                    const startDist = 50 // Start close to center
                    line.x = centerX + Math.cos(newAngle) * startDist
                    line.y = centerY + Math.sin(newAngle) * startDist
                }

                ctx.lineWidth = line.width
                ctx.beginPath()
                ctx.moveTo(line.x, line.y)
                ctx.lineTo(line.x - Math.cos(angle) * line.length, line.y - Math.sin(angle) * line.length)
                ctx.stroke()
            })

            animationFrameId = requestAnimationFrame(draw)
        }

        window.addEventListener('resize', resize)
        resize()
        draw()

        return () => {
            window.removeEventListener('resize', resize)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 pointer-events-none opacity-30 mix-blend-screen"
        />
    )
}
