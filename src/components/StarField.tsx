import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const StarField = ({ count = 3000 }) => {
  const points = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      pos[i3] = (Math.random() - 0.5) * 200;
      pos[i3 + 1] = (Math.random() - 0.5) * 200;
      pos[i3 + 2] = (Math.random() - 0.5) * 200;

      // Mix of cyan and white stars
      const isCyan = Math.random() > 0.7;
      col[i3] = isCyan ? 0 : 0.8 + Math.random() * 0.2;
      col[i3 + 1] = isCyan ? 0.9 + Math.random() * 0.1 : 0.8 + Math.random() * 0.2;
      col[i3 + 2] = isCyan ? 1 : 0.9 + Math.random() * 0.1;
    }
    return [pos, col];
  }, [count]);

  useFrame((_, delta) => {
    if (points.current) {
      points.current.rotation.y += delta * 0.01;
      points.current.rotation.x += delta * 0.005;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.3} vertexColors transparent opacity={0.8} sizeAttenuation />
    </points>
  );
};

export default StarField;
