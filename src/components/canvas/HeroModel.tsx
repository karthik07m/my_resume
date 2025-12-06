'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Stars } from '@react-three/drei'
import { useGesture } from '@use-gesture/react'
import * as THREE from 'three'

export default function HeroModel() {
    const groupRef = useRef<THREE.Group>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [rotation, setRotation] = useState({ x: 0.4, y: 0 }) // Initial elegant tilt
    const lastRotation = useRef({ x: 0.4, y: 0 })

    // Interactive drag to rotate the system
    const bind = useGesture({
        onDrag: ({ down, movement: [mx, my] }) => {
            setIsDragging(down)
            if (down) {
                const sensitivity = 0.002
                setRotation({
                    x: lastRotation.current.x + my * sensitivity,
                    y: lastRotation.current.y + mx * sensitivity
                })
            } else {
                lastRotation.current = rotation
            }
        }
    })

    useFrame((state, delta) => {
        if (!groupRef.current) return

        // Smooth rotation interpolation
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, rotation.x, 0.1)
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotation.y + (isDragging ? 0 : state.clock.elapsedTime * 0.05), 0.1)
    })

    return (
        <group ref={groupRef} {...(bind() as any)} position={[0, 0, -4]}> {/* Pushed back to frame text */}

            {/* Background Starfield for depth */}
            <Stars radius={20} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />

            {/* Elegant Orbital Rings - Large radius to encompass text */}
            <OrbitRing radius={3.5} speed={0.2} color="#00ff41" thickness={0.015} />
            <OrbitRing radius={5.5} speed={0.15} color="#00ff88" thickness={0.01} />
            <OrbitRing radius={7.5} speed={0.1} color="#00cc33" thickness={0.005} />

            {/* Planets - Small, glowing, and distant */}
            <Planet radius={3.5} speed={0.3} size={0.12} color="#00ff41" />
            <Planet radius={5.5} speed={0.2} size={0.18} color="#00ff88" />
            <Planet radius={7.5} speed={0.15} size={0.25} color="#00cc33" />

            {/* Central Ambient Glow (No solid sphere to block text) */}
            <pointLight position={[0, 0, 0]} intensity={1.5} color="#00ff41" distance={15} />
        </group>
    )
}

// Minimalist Orbit Ring
function OrbitRing({ radius, speed, color, thickness }: { radius: number, speed: number, color: string, thickness: number }) {
    const ref = useRef<THREE.Mesh>(null)

    useFrame((state, delta) => {
        if (ref.current) {
            // Subtle wobble for organic feel
            ref.current.rotation.x = Math.PI / 2 + Math.sin(state.clock.elapsedTime * speed * 0.5) * 0.1
            ref.current.rotation.y = Math.cos(state.clock.elapsedTime * speed * 0.3) * 0.1
        }
    })

    return (
        <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius, thickness, 32, 128]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={1.5}
                transparent
                opacity={0.4}
            />
        </mesh>
    )
}

// Glowing Planet
function Planet({ radius, speed, size, color }: { radius: number, speed: number, size: number, color: string }) {
    const ref = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = state.clock.elapsedTime * speed
        }
    })

    return (
        <group ref={ref}>
            <mesh position={[radius, 0, 0]}>
                <sphereGeometry args={[size, 32, 32]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={3}
                    toneMapped={false}
                />
                {/* Planet Glow Halo */}
                <mesh scale={[1.5, 1.5, 1.5]}>
                    <sphereGeometry args={[size, 32, 32]} />
                    <meshBasicMaterial
                        color={color}
                        transparent
                        opacity={0.2}
                    />
                </mesh>
            </mesh>
        </group>
    )
}
