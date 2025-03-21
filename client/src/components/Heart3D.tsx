import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

const Heart = () => {
  const mesh = useRef<Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (mesh.current) {
      // Pulse animation
      mesh.current.scale.x = mesh.current.scale.y = mesh.current.scale.z = 1 + Math.sin(Date.now() * 0.005) * (hovered ? 0.1 : 0.05);
    }
  });

  return (
    <mesh
      ref={mesh}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <torusKnotGeometry args={[1, 0.4, 100, 16]} /> {/* Placeholder; replace with heart model */}
      <meshStandardMaterial color={hovered ? 'red' : 'pink'} />
    </mesh>
  );
};

export default function Heart3D() {
  return (
    <Canvas style={{ position: 'absolute', top: 0, left: 0 }}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Heart />
    </Canvas>
  );
}