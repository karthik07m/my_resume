"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { FontLoader, TextGeometry, MeshSurfaceSampler } from "three-stdlib";

type ShapeType = "sphere" | "cube" | "appian";

export function CodingShape() {
    const points = useRef<THREE.Points>(null!);
    const [shape, setShape] = useState<ShapeType>("sphere");

    // Load font
    const font = useLoader(FontLoader, "https://threejs.org/examples/fonts/helvetiker_bold.typeface.json");

    // Target positions for each shape
    const positions = useMemo(() => {
        const count = 6000; // Increased for longer text
        const sphere = new Float32Array(count * 3);
        const cube = new Float32Array(count * 3);
        const appian = new Float32Array(count * 3);

        const spherical = new THREE.Spherical();
        const vector = new THREE.Vector3();

        // 1. Sphere Generation
        for (let i = 0; i < count; i++) {
            const phi = Math.acos(-1 + (2 * i) / count);
            const theta = Math.sqrt(count * Math.PI) * phi;
            spherical.set(2, phi, theta);
            vector.setFromSpherical(spherical);
            sphere[i * 3] = vector.x;
            sphere[i * 3 + 1] = vector.y;
            sphere[i * 3 + 2] = vector.z;
        }

        // 2. Cube Generation
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 3;
            const y = (Math.random() - 0.5) * 3;
            const z = (Math.random() - 0.5) * 3;
            const maxVal = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
            const scale = 2 / maxVal;
            cube[i * 3] = x * scale;
            cube[i * 3 + 1] = y * scale;
            cube[i * 3 + 2] = z * scale;
        }

        // 3. Appian Text Generation
        if (font) {
            const geometry = new TextGeometry("Senior Appian\nDeveloper", {
                font: font,
                size: 0.5, // Smaller size for longer text
                height: 0.1,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.02,
                bevelSize: 0.01,
                bevelOffset: 0,
                bevelSegments: 5,
            } as any);

            geometry.center();

            // Create a mesh to sample from
            const material = new THREE.MeshBasicMaterial();
            const mesh = new THREE.Mesh(geometry, material);
            const sampler = new MeshSurfaceSampler(mesh).build();
            const tempPosition = new THREE.Vector3();

            for (let i = 0; i < count; i++) {
                sampler.sample(tempPosition);
                appian[i * 3] = tempPosition.x * 1.2;
                appian[i * 3 + 1] = tempPosition.y * 1.2;
                appian[i * 3 + 2] = tempPosition.z * 1.2;
            }
        }

        return { sphere, cube, appian };
    }, [font]);

    // Current buffer positions
    const bufferPositions = useMemo(() => new Float32Array(positions.sphere), [positions]);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        if (shape !== 'appian') {
            // Rotation for Sphere/Cube
            points.current.rotation.y = t * 0.1;
            points.current.rotation.z = t * 0.05;
        } else {
            // Gentle Float (No Rotation) for Text
            points.current.rotation.y = 0;
            points.current.rotation.z = 0;
            points.current.position.y = Math.sin(t * 0.5) * 0.1;
        }

        // Morphing Logic
        const target = positions[shape];
        const current = points.current.geometry.attributes.position.array as Float32Array;

        // Lerp factor
        const lerpSpeed = 0.05;

        for (let i = 0; i < current.length; i++) {
            current[i] += (target[i] - current[i]) * lerpSpeed;
        }

        points.current.geometry.attributes.position.needsUpdate = true;
    });

    const handleClick = () => {
        setShape(prev => {
            if (prev === "sphere") return "cube";
            if (prev === "cube") return "appian";
            return "sphere";
        });
    };

    return (
        <>
            <OrbitControls enableZoom={true} enablePan={false} autoRotate={false} />
            <points
                ref={points}
                onClick={handleClick}
                onPointerOver={() => document.body.style.cursor = 'pointer'}
                onPointerOut={() => document.body.style.cursor = 'auto'}
            >
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={bufferPositions.length / 3}
                        array={bufferPositions}
                        itemSize={3}
                        args={[bufferPositions, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.04}
                    color="#22c55e"
                    sizeAttenuation={true}
                    transparent={true}
                    opacity={0.8}
                    blending={THREE.AdditiveBlending}
                />
            </points>
        </>
    );
}
