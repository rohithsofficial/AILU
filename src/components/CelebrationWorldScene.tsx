"use client";

// The optional 3D scene behind the home story (desktop only, loaded lazily).
import { Canvas } from "@react-three/fiber";

function Person({ position, tone = "#FFFDF7", scale = 1 }: { position: [number, number, number]; tone?: string; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.44, 0]} castShadow><cylinderGeometry args={[0.12, 0.17, 0.62, 8]} /><meshStandardMaterial color={tone} roughness={0.82} /></mesh>
      <mesh position={[0, 0.9, 0]} castShadow><sphereGeometry args={[0.15, 12, 10]} /><meshStandardMaterial color="#e8bb8d" roughness={0.9} /></mesh>
      <mesh position={[-0.2, 0.45, 0]} rotation={[0, 0, -0.22]}><cylinderGeometry args={[0.045, 0.055, 0.5, 6]} /><meshStandardMaterial color={tone} roughness={0.85} /></mesh>
      <mesh position={[0.2, 0.45, 0]} rotation={[0, 0, 0.22]}><cylinderGeometry args={[0.045, 0.055, 0.5, 6]} /><meshStandardMaterial color={tone} roughness={0.85} /></mesh>
    </group>
  );
}

function Room({ chapter }: { chapter: number }) {
  const guests = [
    [-2.6, -1.05, 0.55], [-1.75, -1.05, 1.05], [-0.9, -1.05, 0.65],
    [0.9, -1.05, 0.65], [1.75, -1.05, 1.05], [2.6, -1.05, 0.55],
  ] as [number, number, number][];

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[-3, 5, 4]} intensity={2} color="#fff4d4" />
      <pointLight position={[2.5, 2.8, -1.8]} intensity={chapter > 0 ? 28 : 12} color="#F5C400" distance={9} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.15, 0]} receiveShadow>
        <planeGeometry args={[12, 10]} /><meshStandardMaterial color="#171a16" roughness={0.84} />
      </mesh>
      <mesh position={[0, 1.1, -3.6]}><boxGeometry args={[12, 4.5, 0.12]} /><meshStandardMaterial color="#1b1b17" roughness={0.92} /></mesh>
      <mesh position={[0, -0.88, -1.75]} castShadow><boxGeometry args={[5.8, 0.5, 1.25]} /><meshStandardMaterial color="#29251a" roughness={0.62} /></mesh>
      <mesh position={[0, -0.58, -1.75]}><boxGeometry args={[5.4, 0.08, 1.05]} /><meshStandardMaterial color="#F5C400" roughness={0.5} /></mesh>
      <mesh position={[0, 1.65, -3.35]}><boxGeometry args={[4.2, 2.1, 0.08]} /><meshStandardMaterial color={chapter >= 2 ? "#342b13" : "#202019"} roughness={0.8} /></mesh>
      {chapter >= 1 && <>
        {[-2.2, -1.1, 0, 1.1, 2.2].map((x, index) => <group key={x} position={[x, -1.13, -1.2 + (index % 2) * 0.25]}>
          <mesh position={[0, 0.16, 0]}><boxGeometry args={[0.54, 0.08, 0.48]} /><meshStandardMaterial color="#b59a61" roughness={0.75} /></mesh>
          <mesh position={[0, 0.48, -0.18]}><boxGeometry args={[0.52, 0.62, 0.07]} /><meshStandardMaterial color="#8e774a" roughness={0.82} /></mesh>
          {[[-0.19, 0.08], [0.19, 0.08], [-0.19, -0.16], [0.19, -0.16]].map(([lx, lz]) => <mesh key={`${lx}-${lz}`} position={[lx, 0.02, lz]}><cylinderGeometry args={[0.025, 0.025, 0.3, 6]} /><meshStandardMaterial color="#806d45" /></mesh>)}
        </group>)}
      </>}
      {chapter >= 2 && <>
        {[-2, -1, 0, 1, 2].map((x) => <mesh key={x} position={[x, 2.22, -2.45]}><sphereGeometry args={[0.16, 10, 8]} /><meshStandardMaterial color="#F5C400" emissive="#F5C400" emissiveIntensity={0.38} /></mesh>)}
        <mesh position={[0, 2.42, -3.25]}><boxGeometry args={[4.3, 0.09, 0.1]} /><meshStandardMaterial color="#F5C400" emissive="#F5C400" emissiveIntensity={0.35} /></mesh>
      </>}
      {chapter >= 3 && <>
        <Person position={[-1.5, -0.7, -2.3]} tone="#F5C400" scale={1.05} />
        <Person position={[0, -0.7, -2.1]} tone="#fffdf7" scale={1.08} />
        <Person position={[1.45, -0.7, -2.3]} tone="#bc9e5f" scale={1.05} />
      </>}
      {chapter >= 4 && guests.map((position, index) => <Person key={index} position={position} tone={index % 2 ? "#F5C400" : "#d7d1c2"} scale={0.8} />)}
      {chapter >= 2 && [-2.8, 2.8].map((x) => <group key={x} position={[x, 1.2, -1.9]}>
        <mesh rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.86, 3.5, 20, 1, true]} /><meshBasicMaterial color="#F5C400" transparent opacity={0.055} depthWrite={false} /></mesh>
      </group>)}
    </>
  );
}

export default function CelebrationWorldScene({ chapter }: { chapter: number }) {
  return (
    <Canvas aria-hidden dpr={[1, 1.25]} frameloop="demand" camera={{ position: [0, 1.5, 8.6], fov: 42 }} gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}>
      <Room chapter={chapter} />
    </Canvas>
  );
}
