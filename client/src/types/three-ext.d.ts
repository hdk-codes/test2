import * as THREE from 'three';

declare module 'three' {
  export class Material {
    color: Color;
    opacity: number;
    transparent: boolean;
  }

  export class MeshBasicMaterial extends Material {
    color: Color;
    opacity: number;
    transparent: boolean;
  }

  export class PointsMaterial extends Material {
    size: number;
    sizeAttenuation: boolean;
  }

  interface WebGLRenderer {
    forceContextLoss?(): void;
    dispose?(): void;
  }

  interface PointLight {
    color: THREE.Color;
  }

  interface Light {
    color: THREE.Color;
  }

  interface Mesh {
    material: THREE.Material;
  }

  interface Object3D {
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number; set(x: number, y: number, z: number): void };
    scale: { x: number; y: number; z: number; set(x: number, y: number, z: number): void };
  }

  export class Color {
    constructor(hex: number | string);
    getHex(): number;
    setHex(hex: number): this;
  }
}
