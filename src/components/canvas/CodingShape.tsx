"use client";

import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { FontLoader, TextGeometry, MeshSurfaceSampler } from "three-stdlib";
import type { Font } from "three-stdlib";

export const FORMS = ["Appian", "Shuriken", "Mangekyō", "Santōryū", "MK"] as const;
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
    const shuriken = new Float32Array(COUNT * 3);
    const mangekyo = new Float32Array(COUNT * 3);
    const santoryu = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
        // Shuriken: 4-point star, radius follows a triangle wave, filled, thin slab with a center hole
        const a = rand() * Math.PI * 2;
        const wave = 1 - Math.abs(((a * 4) / Math.PI) % 2 - 1); // 0 at valleys, 1 at points
        const rMax = 0.7 + 1.6 * wave;
        const r = 0.35 + (rMax - 0.35) * Math.sqrt(rand());
        shuriken.set([r * Math.cos(a), r * Math.sin(a), (rand() - 0.5) * 0.2], i * 3);

        // Mangekyō (Shisui's): outer ring, pupil, and four blades curving into a pinwheel
        const bucket = i % 10;
        let mr: number, ma: number;
        if (bucket < 3) { mr = 2 + (rand() - 0.5) * 0.12; ma = rand() * Math.PI * 2; }
        else if (bucket < 4) { mr = 0.28 * Math.sqrt(rand()); ma = rand() * Math.PI * 2; }
        else {
            mr = 0.3 + 1.65 * rand();
            const along = (mr - 0.3) / 1.65;
            ma = ((i % 4) * Math.PI) / 2 + 1.1 * Math.pow(along, 1.5) + (rand() - 0.5) * 0.9 * Math.sin(Math.PI * along);
        }
        mangekyo.set([mr * Math.cos(ma), mr * Math.sin(ma), (rand() - 0.5) * 0.15], i * 3);

        // Santōryū (Zoro's three swords): crossed at 0° and ±45°, blade + hilt + guard each
        const sa = [0, Math.PI / 4, -Math.PI / 4][i % 3];
        const part = rand();
        let sx: number, sy: number;
        if (part < 0.7) { sx = -1.0 + 3.1 * rand(); sy = (rand() - 0.5) * 0.08 + 0.025 * (sx + 1) ** 2; } // curved blade
        else if (part < 0.9) { sx = -2.1 + 0.95 * rand(); sy = (rand() - 0.5) * 0.18; } // hilt
        else { sx = -1.1 + (rand() - 0.5) * 0.08; sy = (rand() - 0.5) * 0.45; } // tsuba
        santoryu.set([sx * Math.cos(sa) - sy * Math.sin(sa), sx * Math.sin(sa) + sy * Math.cos(sa), (rand() - 0.5) * 0.1], i * 3);
    }

    return [fromText(font, "Appian", 0.9), shuriken, mangekyo, santoryu, fromText(font, "MK", 1.6)];
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
        } else if (FORMS[form] === "Shuriken" || FORMS[form] === "Mangekyō") {
            obj.rotation.set(0, 0, s * 1.5);
            obj.position.y = 0;
        } else {
            // Santōryū
            obj.rotation.set(0, Math.sin(s * 0.8) * 0.4, 0);
            obj.position.y = 0;
        }

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
