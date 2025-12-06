'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial, Stars, Torus } from '@react-three/drei'
import * as THREE from 'three'

export default function AnimeHeroModel() {
    const groupRef = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
            groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.1
        }
    })

    return (
        <group ref={groupRef} position={[0, 0, -2]}>
            {/* Background Stars */}
            <Stars radius={50} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            {/* Core Energy Sphere (Rasengan / Spirit Bomb vibe) */}
            <Sphere args={[1.5, 64, 64]}>
                <MeshDistortMaterial
                    color="#00f3ff"
                    emissive="#00f3ff"
                    emissiveIntensity={2}
                    distort={0.4}
                    speed={2}
                    roughness={0}
                />
            </Sphere>

            {/* Inner Aura */}
            <Sphere args={[1.8, 64, 64]}>
                <MeshDistortMaterial
                    color="#bc13fe"
                    emissive="#bc13fe"
                    emissiveIntensity={0.5}
                    distort={0.6}
                    speed={3}
                    transparent
                    opacity={0.3}
                    side={THREE.DoubleSide}
                />
            </Sphere>

            {/* Orbiting Rings (Seals / Tech Rings) */}
            <OrbitingRing radius={3} speed={0.5} color="#ff9900" rotation={[Math.PI / 3, 0, 0]} />
            <OrbitingRing radius={4} speed={0.3} color="#00ff41" rotation={[-Math.PI / 4, 0, 0]} />
            <OrbitingRing radius={5} speed={0.2} color="#00f3ff" rotation={[0, Math.PI / 6, 0]} />

            {/* Floating Energy Particles */}
            <EnergyMotes count={50} />
        </group>
    )
}

function OrbitingRing({ radius, speed, color, rotation }: { radius: number, speed: number, color: string, rotation: [number, number, number] }) {
    const ref = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.z += speed * 0.01
            ref.current.rotation.x = rotation[0] + Math.sin(state.clock.elapsedTime * speed) * 0.1
        }
    })

    return (
        <group rotation={rotation}>
            <Torus args={[radius, 0.05, 16, 100]} ref={ref}>
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={2}
                    transparent
                    opacity={0.6}
                />
            </Torus>
        </group>
    )
}

function EnergyMotes({ count }: { count: number }) {
    const groupRef = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y -= 0.005
        }
    })

    return (
        <group ref={groupRef}>
            {Array.from({ length: count }).map((_, i) => {
                const angle = (i / count) * Math.PI * 2
                const radius = 6 + Math.random() * 4
                const y = (Math.random() - 0.5) * 10
                return (
                    <mesh key={i} position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]}>
                        <sphereGeometry args={[0.05, 8, 8]} />
                        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
                    </mesh>
                )
            })}
        </group>
    )
}
