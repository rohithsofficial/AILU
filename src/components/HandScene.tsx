"use client";
import { Canvas } from "@react-three/fiber";
import { Float, useTexture } from "@react-three/drei";
import { BRAND } from "@/lib/brand";

function Hand() {
  const map = useTexture(BRAND.hand);
  return (
    <Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.6}>
      <mesh>
        <planeGeometry args={[2.2, 2.2]} />
        <meshStandardMaterial map={map} transparent roughness={0.6} />
      </mesh>
      {/* depth: a faint back plate offset behind the logo */}
      <mesh position={[0, 0, -0.12]} scale={1.02}>
        <planeGeometry args={[2.2, 2.2]} />
        <meshBasicMaterial map={map} transparent opacity={0.25} color="#F5C400" />
      </mesh>
    </Float>
  );
}

export default function HandScene() {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 4], fov: 40 }} gl={{ antialias: false, powerPreference: "low-power" }}>
      <ambientLight intensity={0.7} />
      <pointLight position={[2, 2, 3]} intensity={25} color="#F5C400" />
      <Hand />
    </Canvas>
  );
}
