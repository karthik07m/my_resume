"use client";

import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { FontLoader, TextGeometry, MeshSurfaceSampler } from "three-stdlib";
import type { Font } from "three-stdlib";
import { FORMS } from "./forms";

const COUNT = 6000;
const BALL_STARS = [4, 1, 2, 3, 5, 6, 7]; // star count of each Dragon Ball, the middle one first
const BALL_R = 0.62;
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

// A point on a Dragon Ball of radius R. Half the points make the shell and half are packed into its stars on the
// face (a ring of them, with one in the middle from five up), so the stars glow hotter than the shell.
const ballPoint = (rand: () => number, stars: number, R: number): [number, number, number] => {
    if (rand() < 0.5) {
        const ring = stars > 4 ? stars - 1 : stars > 1 ? stars : 0;
        const star = Math.floor(rand() * stars);
        const sa = (star / ring) * Math.PI * 2 + Math.PI / 2;
        const off = star < ring ? R * (stars > 4 ? 0.52 : 0.42) : 0;
        const size = R * (stars === 1 ? 0.45 : stars > 4 ? 0.2 : 0.26);
        const ta = rand() * Math.PI * 2;
        const point = 1 - Math.abs((((ta * 5) / Math.PI + 1) % 2) - 1); // 1 at the five tips, 0 between them
        const tr = size * (0.4 + 0.6 * point) * Math.sqrt(rand());
        const x = (off && off * Math.cos(sa)) + tr * Math.sin(ta);
        const y = (off && off * Math.sin(sa)) + tr * Math.cos(ta);
        return [x, y, Math.sqrt(R * R - x * x - y * y)];
    }
    const u = rand() * 2 - 1;
    const th = rand() * Math.PI * 2;
    const girth = R * Math.sqrt(1 - u * u);
    return [girth * Math.cos(th), R * u, girth * Math.sin(th)];
};

// Where the seven blips sit on the Dragon Radar's screen.
const BLIPS = [[-0.9, 0.7], [0.5, 1.1], [1.1, 0.3], [0.3, -0.45], [-0.6, -0.95], [0.9, -1.0], [-1.2, -0.2]];
const SCREEN = 1.82;

const buildForms = (font: Font) => {
    const rand = makeRand(4);
    const balls = new Float32Array(COUNT * 3);
    const fourStar = new Float32Array(COUNT * 3);
    const radar = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
        // The seven Dragon Balls: Goku's four-star ball in the middle, the other six around it.
        const b = i % 7;
        const ba = ((b - 1) / 6) * Math.PI * 2 + Math.PI / 2;
        const [x, y, z] = ballPoint(rand, BALL_STARS[b], BALL_R);
        balls.set([(b ? 1.38 * Math.cos(ba) : 0) + x, (b ? 1.38 * Math.sin(ba) : 0) + y, z], i * 3);

        // Grandpa Gohan's keepsake on its own.
        fourStar.set(ballPoint(rand, 4, 1.9), i * 3);

        // The Dragon Radar: the rim of its round screen, the grid, seven blips, and the marker in the middle.
        const part = i % 20;
        let rx: number, ry: number;
        if (part < 6) {
            const a = rand() * Math.PI * 2;
            const r = part < 4 ? 2 : SCREEN;
            rx = r * Math.cos(a); ry = r * Math.sin(a);
        } else if (part < 13) {
            const line = (Math.floor(rand() * 5) - 2) * 0.6;
            const along = (rand() * 2 - 1) * Math.sqrt(SCREEN * SCREEN - line * line);
            [rx, ry] = part % 2 ? [line, along] : [along, line];
        } else if (part < 19) {
            const [bx, by] = BLIPS[Math.floor(rand() * BLIPS.length)];
            const a = rand() * Math.PI * 2;
            const r = 0.14 * Math.sqrt(rand());
            rx = bx + r * Math.cos(a); ry = by + r * Math.sin(a);
        } else {
            let u = rand(), v = rand();
            if (u + v > 1) { u = 1 - u; v = 1 - v; }
            rx = -0.17 * u + 0.17 * v; ry = 0.2 - 0.32 * (u + v);
        }
        radar.set([rx, ry, (rand() - 0.5) * 0.08], i * 3);
    }

    return [balls, fourStar, radar, fromText(font, "Z", 2.6), fromText(font, "Appian", 0.9), fromText(font, "MK", 1.6)];
};

interface Props {
    form: number
    color: string
    onTap: () => void
}

// A particle cloud that morphs between FORMS on tap and can be dragged to rotate.
function CodingShape({ form, color, onTap }: Props) {
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
        // The wordmarks and the Z face the viewer and bob; everything else sways from side to side.
        const isText = FORMS[form] === "Z" || FORMS[form] === "Appian" || FORMS[form] === "MK";
        if (isText) {
            obj.rotation.set(0, 0, 0);
            obj.position.y = Math.sin(t * 0.5) * 0.1;
        } else {
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
                <pointsMaterial size={0.04} color={color} sizeAttenuation transparent opacity={0.8} blending={THREE.AdditiveBlending} />
            </points>
        </>
    );
}

// The hero's whole 3D scene. Default-exported so Hero can lazy-load it, and three.js with it.
export default function HeroShape({ running, ...shape }: Props & { running: boolean }) {
    return (
        <Canvas camera={{ position: [0, 0, 6] }} dpr={[1, 1.5]} frameloop={running ? "always" : "never"}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            {/* The shape waits on its font. Without a boundary in here, that wait suspends the page's own tree around the
                canvas, and when it is shown again React (in dev) remounts it and the renderer drops its WebGL context. */}
            <Suspense fallback={null}>
                <CodingShape {...shape} />
            </Suspense>
        </Canvas>
    );
}
