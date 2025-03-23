import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Points } from 'three';
import { Object3DNode, extend } from '@react-three/fiber';

// Create custom particle material
class ParticlePointsMaterial extends THREE.PointsMaterial {
  constructor() {
    super({
      size: 0.05,
      color: new THREE.Color("#ff69b4"),
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8
    });
  }
}

extend({ ParticlePointsMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    points: Object3DNode<Points, typeof Points>;
    particlePointsMaterial: Object3DNode<ParticlePointsMaterial, typeof ParticlePointsMaterial>;
  }
}

interface ParticlesProps {
  count: number;
}

export function Particles({ count }: ParticlesProps) {
  const points = useRef<THREE.Points>(null);

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    
    return positions;
  }, [count]);

  useFrame((state) => {
    if (!points.current) return;
    const mesh = points.current as unknown as THREE.Object3D;
    mesh.rotation.x = state.clock.elapsedTime * 0.1;
    mesh.rotation.y = state.clock.elapsedTime * 0.2;
  });

  const positionsAttribute = new THREE.BufferAttribute(particlesPosition, 3);

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position"
          {...positionsAttribute}
        />
      </bufferGeometry>
      <particlePointsMaterial />
    </points>
  );
}
