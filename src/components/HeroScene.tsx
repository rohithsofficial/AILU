"use client";

// The 3D hand behind the home hero (desktop only, loaded lazily).
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, useTexture } from "@react-three/drei";
import { useRef } from "react";
import type { Group } from "three";
import { BRAND } from "@/lib/brand";

function Hand() {
  const map = useTexture(BRAND.hand);
  const g = useRef<Group>(null);
  useFrame((s) => {
    if (!g.current) return;
    g.current.rotation.y += (s.pointer.x * 0.5 - g.current.rotation.y) * 0.06;
    g.current.rotation.x += (-s.pointer.y * 0.3 - g.current.rotation.x) * 0.06;
  });
  return (
    <Float speed={1.5} floatIntensity={0.7} rotationIntensity={0.15}>
      <group ref={g}>
        {/* stacked darker copies behind the hand give it real thickness when it tilts */}
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <mesh key={i} position={[0, 0, -i * 0.035]}>
            <planeGeometry args={[3.4, 2.55]} />
            <meshBasicMaterial map={map} transparent color="#8a6200" opacity={0.7} />
          </mesh>
        ))}
        <mesh>
          <planeGeometry args={[3.4, 2.55]} />
          <meshBasicMaterial map={map} transparent />
        </mesh>
      </group>
    </Float>
  );
}

export default function HeroScene() {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 5], fov: 40 }} gl={{ antialias: false, powerPreference: "low-power" }}>
      <Hand />
      <Sparkles count={55} scale={[6, 4, 2]} size={3} speed={0.35} color="#F5C400" />
    </Canvas>
  );
}
