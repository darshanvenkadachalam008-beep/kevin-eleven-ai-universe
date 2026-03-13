import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function PortalStars() {
  const ref = useRef<THREE.Points>(null);

  const [positions] = useState(() => {
    const count = 800;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return pos;
  });

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.02;
    ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.01) * 0.1;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#00f0ff" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function PortalRing({ radius, speed, color }: { radius: number; speed: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = clock.getElapsedTime() * speed;
    ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.3) * 0.3;
  });

  return (
    <mesh ref={ref}>
      <ringGeometry args={[radius - 0.05, radius, 64]} />
      <meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.DoubleSide} />
    </mesh>
  );
}

function PortalGlow({ animating }: { animating: boolean }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const scale = animating ? 2 + clock.getElapsedTime() * 0.5 : 1 + Math.sin(clock.getElapsedTime()) * 0.1;
    ref.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={ref}>
      <circleGeometry args={[0.8, 64]} />
      <meshBasicMaterial color="#00f0ff" transparent opacity={0.05} />
    </mesh>
  );
}

import { useState } from 'react';

interface LoginPortalProps {
  animating: boolean;
}

const LoginPortal = ({ animating }: LoginPortalProps) => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.1} />
        <PortalStars />
        <PortalRing radius={1.5} speed={0.3} color="#00f0ff" />
        <PortalRing radius={2.0} speed={-0.2} color="#8b5cf6" />
        <PortalRing radius={2.5} speed={0.15} color="#00f0ff" />
        <PortalGlow animating={animating} />
      </Canvas>
    </div>
  );
};

export default LoginPortal;
