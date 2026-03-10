import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CentralOrb = () => {
  const ref = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.3;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
      glowRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group>
      {/* Core orb */}
      <mesh ref={ref}>
        <icosahedronGeometry args={[1, 4]} />
        <meshStandardMaterial
          color="#00f0ff"
          emissive="#00f0ff"
          emissiveIntensity={0.4}
          wireframe
          transparent
          opacity={0.7}
        />
      </mesh>
      {/* Inner glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.15} />
      </mesh>
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.05} />
      </mesh>
    </group>
  );
};

export default CentralOrb;
