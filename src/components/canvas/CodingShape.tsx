"use client";

import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { FontLoader, TextGeometry, MeshSurfaceSampler } from "three-stdlib";
import type { Font } from "three-stdlib";

export const FORMS = ["Sphere", "Cube", "Appian", "Torus", "Heart", "Shuriken", "MK"] as const;
const COUNT = 6000;
const FONT_URL = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/fonts/helvetiker_bold.typeface.json`;

// Deterministic LCG so the point cloud is identical on every render (React compiler forbids Math.random here).
const makeRand = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

const fromText = (font: Font, text: string, size: number) => {
    const out = new Float32Array(COUNT * 3);
    const geometry = new TextGeometry(text, { font, size, height: 0.15, curveSegments: 8 });
    geometry.center();
    const sampler = new MeshSurfaceSampler(new THREE.Mesh(geometry)).build();
    const v = new THREE.Vector3();
    for (let i = 0; i < COUNT; i++) {
        sampler.sample(v);
        out.set([v.x, v.y, v.z], i * 3);
    }
    geometry.dispose();
    return out;
};

const buildForms = (font: Font) => {
    const rand = makeRand(1);
    const sphere = new Float32Array(COUNT * 3);
    const cube = new Float32Array(COUNT * 3);
    const torus = new Float32Array(COUNT * 3);
    const heart = new Float32Array(COUNT * 3);
    const shuriken = new Float32Array(COUNT * 3);
    const v = new THREE.Vector3();

    for (let i = 0; i < COUNT; i++) {
        // Sphere: Fibonacci lattice
        const phi = Math.acos(-1 + (2 * i) / COUNT);
        const theta = Math.sqrt(COUNT * Math.PI) * phi;
        v.setFromSphericalCoords(2, phi, theta);
        sphere.set([v.x, v.y, v.z], i * 3);

        // Cube: random point projected onto the surface
        v.set(rand() - 0.5, rand() - 0.5, rand() - 0.5);
        v.multiplyScalar(2 / Math.max(Math.abs(v.x), Math.abs(v.y), Math.abs(v.z)));
        cube.set([v.x, v.y, v.z], i * 3);

        // Torus: R = 1.5, r = 0.55
        const u = rand() * Math.PI * 2, w = rand() * Math.PI * 2;
        torus.set([(1.5 + 0.55 * Math.cos(w)) * Math.cos(u), (1.5 + 0.55 * Math.cos(w)) * Math.sin(u), 0.55 * Math.sin(w)], i * 3);

        // Heart: filled classic heart curve, thin slab
        const t = rand() * Math.PI * 2, s = Math.sqrt(rand());
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        heart.set([(hx * s) / 8, (hy * s) / 8 + 0.2, (rand() - 0.5) * 0.4], i * 3);

        // Shuriken: 4-point star, radius follows a triangle wave, filled, thin slab with a center hole
        const a = rand() * Math.PI * 2;
        const wave = 1 - Math.abs(((a * 4) / Math.PI) % 2 - 1); // 0 at valleys, 1 at points
        const rMax = 0.7 + 1.6 * wave;
        const r = 0.35 + (rMax - 0.35) * Math.sqrt(rand());
        shuriken.set([r * Math.cos(a), r * Math.sin(a), (rand() - 0.5) * 0.2], i * 3);
    }

    return [sphere, cube, fromText(font, "Appian", 0.9), torus, heart, shuriken, fromText(font, "MK", 1.6)];
};

interface Props {
    form: number
    onTap: () => void
}

// A particle cloud that morphs between FORMS on tap and can be dragged to rotate.
export function CodingShape({ form, onTap }: Props) {
    const points = useRef<THREE.Points>(null!);
    const font = useLoader(FontLoader, FONT_URL);
    const forms = useMemo(() => buildForms(font), [font]);
    const buffer = useMemo(() => new Float32Array(forms[0]), [forms]);

    const spin = useRef(0); // accumulated rotation, so a speed change never jumps

    useFrame((state, delta) => {
        const t = state.clock.getElapsedTime();
        const obj = points.current;
        // Sage Mode (see ui/SageMode.tsx) spins everything 4x faster.
        const speed = document.documentElement.hasAttribute("data-sage") ? 4 : 1;
        spin.current += delta * speed;
        const s = spin.current;
        const isText = FORMS[form] === "Appian" || FORMS[form] === "MK";
        if (isText) {
            obj.rotation.set(0, 0, 0);
            obj.position.y = Math.sin(t * 0.5) * 0.1;
        } else if (FORMS[form] === "Shuriken") {
            obj.rotation.set(0, 0, s * 1.5);
            obj.position.y = 0;
        } else if (FORMS[form] === "Heart") {
            const beat = 1 + 0.05 * Math.max(0, Math.sin(s * 4));
            obj.scale.set(beat, beat, beat);
            obj.rotation.set(0, Math.sin(s * 0.5) * 0.3, 0);
            obj.position.y = 0;
        } else {
            obj.rotation.y = s * 0.1;
            obj.rotation.z = s * 0.05;
            obj.position.y = 0;
        }
        if (FORMS[form] !== "Heart") obj.scale.set(1, 1, 1);

        const target = forms[form];
        const current = obj.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < current.length; i++) {
            current[i] += (target[i] - current[i]) * 0.05;
        }
        obj.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <>
            <OrbitControls enableZoom={false} enablePan={false} />
            <points
                ref={points}
                onClick={onTap}
                onPointerOver={() => (document.body.style.cursor = "pointer")}
                onPointerOut={() => (document.body.style.cursor = "auto")}
            >
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[buffer, 3]} />
                </bufferGeometry>
                <pointsMaterial size={0.04} color="#34d399" sizeAttenuation transparent opacity={0.8} blending={THREE.AdditiveBlending} />
            </points>
        </>
    );
}
