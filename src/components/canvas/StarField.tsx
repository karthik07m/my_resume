"use client";

import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";

// The fixed star background. Default-exported so the page can lazy-load it, and three.js with it.
export default function StarField({ count }: { count: number }) {
    return (
        // frameloop="demand": the stars render once and never again, instead of a full WebGL frame every 16ms for the whole visit
        <Canvas camera={{ position: [0, 0, 1] }} dpr={[1, 1.5]} frameloop="demand">
            <Stars radius={100} depth={50} count={count} factor={4} saturation={0} fade speed={0} />
        </Canvas>
    );
}
