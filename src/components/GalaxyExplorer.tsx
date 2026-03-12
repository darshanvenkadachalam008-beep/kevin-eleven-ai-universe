import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useRef, useMemo, useState } from 'react';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';

interface CharPlanet {
  id: string;
  name: string;
  personality: string;
  avatar: string | null;
  color: string | null;
}

interface PlanetNodeProps {
  character: CharPlanet;
  index: number;
  total: number;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

function PlanetNode({ character, index, total, onSelect, isSelected }: PlanetNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const color = character.color || '#00f0ff';
  const angle = (index / total) * Math.PI * 2;
  const orbitRadius = 4 + (index % 3) * 1.5;
  const speed = 0.08 + (index % 5) * 0.02;
  const yOffset = (index % 3 - 1) * 0.8;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime() * speed + angle;
    groupRef.current.position.x = Math.cos(t) * orbitRadius;
    groupRef.current.position.z = Math.sin(t) * orbitRadius;
    groupRef.current.position.y = yOffset + Math.sin(t * 2) * 0.3;
    
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
    if (glowRef.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 2 + index) * 0.1;
      glowRef.current.scale.setScalar(s);
    }
  });

  const planetSize = hovered || isSelected ? 0.55 : 0.4;

  return (
    <group ref={groupRef}>
      {/* Glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={hovered ? 0.15 : 0.05} />
      </mesh>
      
      {/* Main planet */}
      <mesh
        ref={meshRef}
        onClick={() => onSelect(character.id)}
        onPointerEnter={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerLeave={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <sphereGeometry args={[planetSize, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.3}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Name label */}
      {(hovered || isSelected) && (
        <Html center distanceFactor={8} style={{ pointerEvents: 'none' }}>
          <div className="text-center whitespace-nowrap">
            <div className="text-2xl mb-1">{character.avatar || '🤖'}</div>
            <div
              className="font-display text-xs font-bold tracking-wider px-3 py-1 rounded-full backdrop-blur-sm border"
              style={{
                color,
                backgroundColor: 'rgba(0,0,0,0.7)',
                borderColor: `${color}60`,
                textShadow: `0 0 10px ${color}`,
              }}
            >
              {character.name}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function OrbitRing({ radius, color }: { radius: number; color: string }) {
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return pts;
  }, [radius]);

  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  return (
    <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.08 }))} />
  );
}

function Stars() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const pos = new Float32Array(3000);
    for (let i = 0; i < 3000; i++) {
      pos[i] = (Math.random() - 0.5) * 60;
    }
    return pos;
  }, []);

  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.0002;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={1000} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#ffffff" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function CenterStar() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const s = 1 + Math.sin(clock.getElapsedTime()) * 0.1;
      ref.current.scale.setScalar(s);
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.6, 32, 32]} />
      <meshBasicMaterial color="#00f0ff" transparent opacity={0.3} />
    </mesh>
  );
}

interface GalaxyExplorerProps {
  characters: CharPlanet[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const GalaxyExplorer = ({ characters, selectedId, onSelect }: GalaxyExplorerProps) => {
  return (
    <Canvas camera={{ position: [0, 6, 12], fov: 55 }} gl={{ antialias: true, alpha: true }}>
      <Suspense fallback={null}>
        <ambientLight intensity={0.15} />
        <pointLight position={[0, 0, 0]} intensity={2} color="#00f0ff" distance={20} />
        <pointLight position={[8, 4, -4]} intensity={0.6} color="#8b5cf6" />
        <pointLight position={[-6, -3, 5]} intensity={0.4} color="#1e3a5f" />

        <Stars />
        <CenterStar />
        
        <OrbitRing radius={4} color="#00f0ff" />
        <OrbitRing radius={5.5} color="#8b5cf6" />
        <OrbitRing radius={7} color="#00f0ff" />

        {characters.map((char, i) => (
          <PlanetNode
            key={char.id}
            character={char}
            index={i}
            total={characters.length}
            onSelect={onSelect}
            isSelected={selectedId === char.id}
          />
        ))}

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={5}
          maxDistance={20}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 6}
        />
      </Suspense>
    </Canvas>
  );
};

export default GalaxyExplorer;
