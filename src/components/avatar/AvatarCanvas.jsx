import { Environment, ContactShadows, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Avatar } from './Avatar.jsx';

function Scene() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
      <Environment preset="city" />
      <ContactShadows
        opacity={0.4}
        scale={4}
        blur={1.5}
        far={4}
        resolution={128}
        position={[0, -1.6, 0]}
      />
      <Suspense fallback={null}>
        <Avatar scale={1} position={[0, -1.6, 0]} />
      </Suspense>
    </>
  );
}

export default function AvatarCanvas({ visible }) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        width: '220px',
        height: '280px',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(59,143,255,0.25)',
        background: 'linear-gradient(180deg, rgba(5,13,26,0.88) 0%, rgba(10,22,40,0.94) 100%)',
        backdropFilter: 'blur(12px)',
        zIndex: 25,
        boxShadow: '0 0 40px rgba(59,143,255,0.15)',
      }}
    >
      <Canvas
        shadows
        camera={{ position: [0, 0, 3], fov: 40 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
