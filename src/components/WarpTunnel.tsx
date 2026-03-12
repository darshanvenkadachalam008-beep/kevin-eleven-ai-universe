import { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

function WarpParticles() {
  const ref = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const startTime = useRef(Date.now());

  const [positions, speeds] = useState(() => {
    const count = 600;
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 3;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = Math.sin(angle) * radius;
      pos[i * 3 + 2] = -Math.random() * 40;
      spd[i] = 15 + Math.random() * 30;
    }
    return [pos, spd] as const;
  })[0];

  useFrame(() => {
    if (!ref.current) return;
    const elapsed = (Date.now() - startTime.current) / 1000;
    const posArr = ref.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < posArr.length / 3; i++) {
      posArr[i * 3 + 2] += speeds[i] * 0.016;
      if (posArr[i * 3 + 2] > 5) {
        posArr[i * 3 + 2] = -40;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;

    // Stretch particles over time for warp effect
    if (materialRef.current) {
      materialRef.current.size = 0.05 + Math.min(elapsed * 0.15, 0.3);
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial ref={materialRef} size={0.05} color="#00f0ff" transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

function TunnelRings() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      mesh.position.z += 0.3;
      if (mesh.position.z > 5) mesh.position.z = -30;
      mesh.rotation.z = clock.getElapsedTime() * 0.5 + i;
    });
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} position={[0, 0, -i * 3]} rotation={[0, 0, i * 0.3]}>
          <ringGeometry args={[2.5, 2.7, 32]} />
          <meshBasicMaterial color="#00f0ff" transparent opacity={0.06} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

interface WarpTunnelProps {
  active: boolean;
  onComplete: () => void;
}

const WarpTunnel = ({ active, onComplete }: WarpTunnelProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !containerRef.current || !flashRef.current) return;

    const tl = gsap.timeline({
      onComplete: () => {
        onComplete();
      },
    });

    // Fade in the tunnel
    tl.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.in' });

    // Flash to white at the end
    tl.fromTo(
      flashRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: 'power2.in' },
      '+=1.0'
    );

    // Fade everything out
    tl.to(containerRef.current, { opacity: 0, duration: 0.3 }, '+=0.1');

    return () => { tl.kill(); };
  }, [active, onComplete]);

  if (!active) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[70]" style={{ opacity: 0 }}>
      <Canvas camera={{ position: [0, 0, 3], fov: 75 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.1} />
        <WarpParticles />
        <TunnelRings />
      </Canvas>
      <div
        ref={flashRef}
        className="absolute inset-0"
        style={{ background: 'radial-gradient(circle, white 0%, hsl(185 100% 50% / 0.3) 60%, transparent 100%)', opacity: 0 }}
      />
    </div>
  );
};

export default WarpTunnel;
