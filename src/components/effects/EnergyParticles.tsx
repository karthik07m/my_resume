'use client'

import { useEffect, useRef } from 'react'

export default function EnergyParticles() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const mouseRef = useRef({ x: 0, y: 0 })

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number
        let particles: Particle[] = []

        class Particle {
            x: number
            y: number
            size: number
            speedX: number
            speedY: number
            color: string

            constructor() {
                this.x = Math.random() * canvas!.width
                this.y = Math.random() * canvas!.height
                this.size = Math.random() * 3 + 1
                this.speedX = Math.random() * 2 - 1
                this.speedY = Math.random() * 2 - 1

                const colors = ['#22c55e', '#10b981', '#4ade80', '#00ff41', '#059669']
                this.color = colors[Math.floor(Math.random() * colors.length)]
            }

            update() {
                this.x += this.speedX
                this.y += this.speedY

                // Mouse interaction
                const dx = mouseRef.current.x - this.x
                const dy = mouseRef.current.y - this.y
                const distance = Math.sqrt(dx * dx + dy * dy)

                if (distance < 100) {
                    const forceDirectionX = dx / distance
                    const forceDirectionY = dy / distance
                    const force = (100 - distance) / 100
                    const directionX = forceDirectionX * force * 2
                    const directionY = forceDirectionY * force * 2

                    this.speedX -= directionX
                    this.speedY -= directionY
                }

                if (this.size > 0.2) this.size -= 0.01
                if (this.size <= 0.2) {
                    this.x = Math.random() * canvas!.width
                    this.y = Math.random() * canvas!.height
                    this.size = Math.random() * 3 + 1
                    this.speedX = Math.random() * 2 - 1
                    this.speedY = Math.random() * 2 - 1
                }
            }

            draw() {
                ctx!.fillStyle = this.color
                ctx!.beginPath()
                ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2)
                ctx!.fill()
            }
        }

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            initParticles()
        }

        const initParticles = () => {
            particles = []
            for (let i = 0; i < 100; i++) {
                particles.push(new Particle())
            }
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            particles.forEach(particle => {
                particle.update()
                particle.draw()
            })
            animationFrameId = requestAnimationFrame(animate)
        }

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY }
        }

        window.addEventListener('resize', resize)
        window.addEventListener('mousemove', handleMouseMove)
        resize()
        animate()

        return () => {
            window.removeEventListener('resize', resize)
            window.removeEventListener('mousemove', handleMouseMove)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 pointer-events-none"
        />
    )
}
