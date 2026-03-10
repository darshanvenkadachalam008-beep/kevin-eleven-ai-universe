import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import StarField from './StarField';
import HolographicRing from './HolographicRing';
import FloatingParticles from './FloatingParticles';
import CentralOrb from './CentralOrb';

const HeroScene = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.2} />
          <pointLight position={[0, 0, 5]} intensity={1.5} color="#00f0ff" />
          <pointLight position={[5, 3, 0]} intensity={0.8} color="#8b5cf6" />
          <pointLight position={[-5, -3, 0]} intensity={0.5} color="#1e3a5f" />

          <StarField />
          <FloatingParticles />
          <CentralOrb />
          <HolographicRing radius={2.5} color="#00f0ff" speed={0.2} tilt={0.5} />
          <HolographicRing radius={3.2} color="#8b5cf6" speed={-0.15} tilt={-0.3} />
          <HolographicRing radius={4} color="#00f0ff" speed={0.1} tilt={0.8} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default HeroScene;
