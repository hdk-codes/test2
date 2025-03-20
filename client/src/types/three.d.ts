declare module 'three' {
  export class Scene {}
  export class PerspectiveCamera {
    constructor(fov: number, aspect: number, near: number, far: number);
    position: { x: number; y: number; z: number };
    updateProjectionMatrix(): void;
    aspect: number;
  }
  export class WebGLRenderer {
    constructor(options?: { alpha?: boolean; antialias?: boolean; powerPreference?: string });
    setSize(width: number, height: number): void;
    setClearColor(color: number, opacity?: number): void;
    setPixelRatio(ratio: number): void;
    domElement: HTMLCanvasElement;
    render(scene: Scene, camera: PerspectiveCamera): void;
  }
  export class Shape {
    constructor();
    moveTo(x: number, y: number): void;
    bezierCurveTo(
      cp1x: number, cp1y: number,
      cp2x: number, cp2y: number,
      x: number, y: number
    ): void;
  }
  export class ExtrudeGeometry {
    constructor(shape: Shape, options?: {
      depth?: number;
      bevelEnabled?: boolean;
      bevelSegments?: number;
      steps?: number;
      bevelSize?: number;
      bevelThickness?: number;
      curveSegments?: number;
    });
  }
  export class SphereGeometry {
    constructor(radius: number, widthSegments: number, heightSegments: number);
  }
  export class BufferGeometry {
    constructor();
    setAttribute(name: string, attribute: BufferAttribute): BufferGeometry;
  }
  export class BufferAttribute {
    constructor(array: Float32Array, itemSize: number);
  }
  export class MeshPhysicalMaterial {
    constructor(options?: {
      color?: number;
      roughness?: number;
      metalness?: number;
      reflectivity?: number;
      clearcoat?: number;
      clearcoatRoughness?: number;
      emissive?: number;
      emissiveIntensity?: number;
      envMapIntensity?: number;
    });
    color: Color;
    emissive: Color;
    emissiveIntensity: number;
  }
  export class MeshBasicMaterial {
    constructor(options?: {
      color?: number;
      transparent?: boolean;
      opacity?: number;
      blending?: number;
    });
  }
  export class ShaderMaterial {
    constructor(options?: {
      uniforms?: any;
      vertexShader?: string;
      fragmentShader?: string;
      blending?: number;
      depthTest?: boolean;
      transparent?: boolean;
    });
    uniforms: any;
  }
  export class Mesh {
    constructor(geometry: any, material: any);
    rotation: { x: number; y: number; z: number };
    position: { x: number; y: number; z: number; copy(pos: any): void };
    scale: { x: number; y: number; z: number; copy(scale: any): void };
    add(object: any): void;
    lookAt(x: number, y: number, z: number): void;
    lookAt(pos: any): void;
  }
  export class Points {
    constructor(geometry: any, material: any);
  }
  export class Texture {
    constructor(image: HTMLCanvasElement);
    needsUpdate: boolean;
  }
  export class DirectionalLight {
    constructor(color: number, intensity: number);
    position: { x: number; y: number; z: number; set(x: number, y: number, z: number): void };
    lookAt(x: number, y: number, z: number): void;
    lookAt(pos: any): void;
  }
  export class AmbientLight {
    constructor(color: number, intensity: number);
  }
  export class PointLight {
    constructor(color: number, intensity: number, distance: number);
    position: { x: number; y: number; z: number; set(x: number, y: number, z: number): void };
  }
  export class SpotLight {
    constructor(color: number, intensity: number, distance: number, angle: number, penumbra: number, decay: number);
    position: { x: number; y: number; z: number; set(x: number, y: number, z: number): void };
    lookAt(x: number, y: number, z: number): void;
    lookAt(pos: any): void;
  }
  export class Color {
    constructor(color?: number | string);
    copy(color: Color): this;
    multiplyScalar(s: number): this;
    lerp(color: Color, alpha: number): this;
  }
  export class Vector3 {
    constructor(x?: number, y?: number, z?: number);
    x: number;
    y: number;
    z: number;
    clone(): Vector3;
    lerp(v: Vector3, alpha: number): this;
  }
  export const AdditiveBlending: number;
}