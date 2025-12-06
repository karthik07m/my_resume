'use client'

import { useRef, useState, MouseEvent as ReactMouseEvent } from 'react'
import { motion } from 'framer-motion'

interface MagneticButtonProps {
    children: React.ReactNode
    className?: string
    onClick?: () => void
}

export default function MagneticButton({ children, className = '', onClick }: MagneticButtonProps) {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isHovered, setIsHovered] = useState(false)

    const handleMouseMove = (e: ReactMouseEvent<HTMLButtonElement>) => {
        if (!buttonRef.current) return

        const rect = buttonRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        const distanceX = e.clientX - centerX
        const distanceY = e.clientY - centerY

        // Stronger magnetic effect for anime feel
        const strength = 0.5
        setPosition({
            x: distanceX * strength,
            y: distanceY * strength
        })
    }

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 })
        setIsHovered(false)
    }

    const handleMouseEnter = () => {
        setIsHovered(true)
    }

    return (
        <motion.button
            ref={buttonRef}
            className={`relative overflow-hidden ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            onClick={onClick}
            animate={{
                x: position.x,
                y: position.y
            }}
            transition={{
                type: 'spring',
                stiffness: 200,
                damping: 10,
                mass: 0.1
            }}
            whileTap={{ scale: 0.9 }}
        >
            {/* Glow Effect */}
            <motion.div
                className="absolute inset-0 bg-white/10 blur-xl rounded-full"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                    opacity: isHovered ? 1 : 0,
                    scale: isHovered ? 1.5 : 0
                }}
                transition={{ duration: 0.3 }}
            />

            <span className="relative z-10">{children}</span>
        </motion.button>
    )
}
