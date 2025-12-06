'use client'

import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { Suspense } from 'react'

export default function Scene({ children }: { children: React.ReactNode }) {
    return (
        <Canvas className="w-full h-full" dpr={[1, 2]} camera={{ position: [0, 0, 6], fov: 45 }}>
            <Suspense fallback={null}>
                <Environment preset="city" />
                {children}
            </Suspense>
        </Canvas>
    )
}
