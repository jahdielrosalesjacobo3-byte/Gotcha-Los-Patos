import React, { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PAINT_COLORS = ["#39FF14", "#FF4500", "#FF007F", "#39FF14", "#39FF14", "#FF4500"];

function PaintBall({ position, color, size = 0.4, mouse }) {
    const ref = useRef();
    const initial = useRef(new THREE.Vector3(...position));
    const speed = useRef(0.4 + Math.random() * 0.6);
    const phase = useRef(Math.random() * Math.PI * 2);

    useFrame((state) => {
        if (!ref.current) return;
        const t = state.clock.getElapsedTime();
        ref.current.position.y = initial.current.y + Math.sin(t * speed.current + phase.current) * 0.4;
        ref.current.position.x = initial.current.x + Math.cos(t * speed.current * 0.7 + phase.current) * 0.25;
        ref.current.rotation.x += 0.005;
        ref.current.rotation.y += 0.008;

        if (mouse?.current) {
            const dx = ref.current.position.x - mouse.current.x * 5;
            const dy = ref.current.position.y - mouse.current.y * 3;
            const dist = Math.hypot(dx, dy);
            if (dist < 2.5) {
                const f = (2.5 - dist) * 0.06;
                ref.current.position.x += (dx / dist) * f;
                ref.current.position.y += (dy / dist) * f;
            }
        }
    });

    return (
        <mesh ref={ref} position={position}>
            <icosahedronGeometry args={[size, 4]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.6}
                metalness={0.4}
                roughness={0.25}
            />
        </mesh>
    );
}

function Particles() {
    const ref = useRef();
    const geometry = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const arr = new Float32Array(800 * 3);
        for (let i = 0; i < 800; i++) {
            arr[i * 3] = (Math.random() - 0.5) * 30;
            arr[i * 3 + 1] = (Math.random() - 0.5) * 18;
            arr[i * 3 + 2] = (Math.random() - 0.5) * 20 - 4;
        }
        geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
        return geo;
    }, []);

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = state.clock.getElapsedTime() * 0.02;
        }
    });

    return (
        <points ref={ref} geometry={geometry}>
            <pointsMaterial size={0.04} color="#39FF14" transparent opacity={0.55} />
        </points>
    );
}

function Scene({ mouse }) {
    const balls = useMemo(() => {
        const arr = [];
        for (let i = 0; i < 18; i++) {
            arr.push({
                position: [
                    (Math.random() - 0.5) * 14,
                    (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 6 - 1,
                ],
                color: PAINT_COLORS[i % PAINT_COLORS.length],
                size: 0.25 + Math.random() * 0.45,
            });
        }
        return arr;
    }, []);

    return (
        <>
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} color="#A7F3A0" />
            <pointLight position={[-5, -3, 2]} intensity={1.5} color="#FF4500" distance={12} />
            <pointLight position={[5, 3, 2]} intensity={1.2} color="#39FF14" distance={12} />
            <Particles />
            {balls.map((b, i) => (
                <PaintBall key={i} {...b} mouse={mouse} />
            ))}
        </>
    );
}

export default function Hero3D() {
    const mouse = useRef({ x: 0, y: 0 });

    const onMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouse.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.current.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    return (
        <div
            className="absolute inset-0 z-0 pointer-events-auto"
            onPointerMove={onMove}
            data-testid="hero-3d-canvas"
        >
            <Canvas
                dpr={[1, 1.5]}
                camera={{ position: [0, 0, 8], fov: 55 }}
                gl={{ antialias: true, powerPreference: "high-performance" }}
                style={{ background: "transparent" }}
            >
                <Suspense fallback={null}>
                    <Scene mouse={mouse} />
                </Suspense>
            </Canvas>
            {/* Bottom dark gradient for legibility */}
            <div className="pointer-events-none absolute inset-0"
                style={{
                    background: "radial-gradient(ellipse at center, transparent 30%, rgba(10,13,10,0.6) 70%, #0A0D0A 100%)",
                }}
            />
            {/* Vignette */}
            <div className="pointer-events-none absolute inset-0"
                style={{
                    background: "linear-gradient(to bottom, rgba(10,13,10,0.4) 0%, transparent 30%, transparent 70%, #0A0D0A 100%)",
                }}
            />
        </div>
    );
}
