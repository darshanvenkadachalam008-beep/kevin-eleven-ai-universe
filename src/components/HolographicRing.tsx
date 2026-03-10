import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface HolographicRingProps {
  radius?: number;
  color?: string;
  speed?: number;
  tilt?: number;
}

const HolographicRing = ({ radius = 3, color = '#00f0ff', speed = 0.3, tilt = 0.3 }: HolographicRingProps) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.z += delta * speed;
    }
  });

  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.02, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </mesh>
  );
};

export default HolographicRing;
