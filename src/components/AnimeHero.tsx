import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useRef, useMemo } from 'react';
import * as THREE from 'three';

function NebulaBg() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const p = new Float32Array(6000);
    for (let i = 0; i < 6000; i++) p[i] = (Math.random() - 0.5) * 80;
    return p;
  }, []);
  const colors = useMemo(() => {
    const c = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      const t = Math.random();
      c[i * 3] = t < 0.3 ? 0 : t < 0.6 ? 0.55 : 0.2;
      c[i * 3 + 1] = t < 0.3 ? 0.94 : t < 0.6 ? 0.36 : 0.6;
      c[i * 3 + 2] = t < 0.3 ? 1 : t < 0.6 ? 0.96 : 1;
    }
    return c;
  }, []);

  useFrame(() => { if (ref.current) ref.current.rotation.y += 0.0003; });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={2000} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={2000} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.08} vertexColors transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

function EnergyParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 200;
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 3 + Math.random() * 5;
      p[i * 3] = Math.cos(angle) * r;
      p[i * 3 + 1] = (Math.random() - 0.5) * 4;
      p[i * 3 + 2] = Math.sin(angle) * r;
    }
    return p;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const geo = ref.current.geometry;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const t = clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      pos.setY(i, pos.getY(i) + Math.sin(t * 2 + i) * 0.003);
    }
    pos.needsUpdate = true;
    ref.current.rotation.y += 0.002;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.12} color="#00f0ff" transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

function CharacterSilhouettes() {
  const groupRef = useRef<THREE.Group>(null);
  const chars = useMemo(() => [
    { x: -3, z: 2, color: '#00f0ff', scale: 1.2 },
    { x: -1, z: 0.5, color: '#8b5cf6', scale: 1.4 },
    { x: 1, z: 0.5, color: '#ff00ff', scale: 1.4 },
    { x: 3, z: 2, color: '#ff6600', scale: 1.2 },
    { x: 0, z: -0.5, color: '#00ff88', scale: 1.6 },
  ], []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      child.position.y = -1.5 + Math.sin(clock.getElapsedTime() * 0.5 + i) * 0.1;
    });
  });

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      {chars.map((c, i) => (
        <group key={i} position={[c.x, -1.5, c.z]}>
          {/* Body silhouette */}
          <mesh>
            <capsuleGeometry args={[0.2 * c.scale, 0.6 * c.scale, 4, 8]} />
            <meshBasicMaterial color="#000" transparent opacity={0.8} />
          </mesh>
          {/* Glowing edge */}
          <mesh>
            <capsuleGeometry args={[0.22 * c.scale, 0.62 * c.scale, 4, 8]} />
            <meshBasicMaterial color={c.color} transparent opacity={0.15} wireframe />
          </mesh>
          {/* Head */}
          <mesh position={[0, 0.5 * c.scale, 0]}>
            <sphereGeometry args={[0.15 * c.scale, 16, 16]} />
            <meshBasicMaterial color="#000" transparent opacity={0.8} />
          </mesh>
          <mesh position={[0, 0.5 * c.scale, 0]}>
            <sphereGeometry args={[0.17 * c.scale, 16, 16]} />
            <meshBasicMaterial color={c.color} transparent opacity={0.2} wireframe />
          </mesh>
          {/* Aura glow */}
          <mesh position={[0, 0.2 * c.scale, 0]}>
            <sphereGeometry args={[0.5 * c.scale, 8, 8]} />
            <meshBasicMaterial color={c.color} transparent opacity={0.05} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const AnimeHero = () => (
  <div className="absolute inset-0 z-0">
    <Canvas camera={{ position: [0, 1, 10], fov: 55 }} gl={{ antialias: true, alpha: true }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.1} />
        <pointLight position={[0, 5, 5]} intensity={1.5} color="#00f0ff" distance={30} />
        <pointLight position={[-5, 3, -2]} intensity={0.8} color="#8b5cf6" distance={20} />
        <pointLight position={[5, -2, 3]} intensity={0.5} color="#ff00ff" distance={15} />
        <NebulaBg />
        <EnergyParticles />
        <CharacterSilhouettes />
      </Suspense>
    </Canvas>
  </div>
);

export default AnimeHero;
