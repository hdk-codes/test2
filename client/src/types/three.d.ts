declare module 'three' {
  export class Scene {
    add(object: Object3D): this;
    remove(object: Object3D): this;
    children: Object3D[];
    background: Color | null;
    environment: Texture | null;
    fog: any;
    overrideMaterial: Material | null;
  }
  
  export class Object3D {
    position: Vector3;
    rotation: { x: number; y: number; z: number };
    scale: Vector3;
    up: Vector3;
    matrix: Matrix4;
    matrixWorld: Matrix4;
    userData: any;
    visible: boolean;
    name: string;
    uuid: string;
    
    add(object: Object3D): this;
    remove(object: Object3D): this;
    lookAt(x: number, y: number, z: number): void;
    lookAt(vector: Vector3): void;
    traverse(callback: (object: Object3D) => void): void;
    traverseVisible(callback: (object: Object3D) => void): void;
    clone(recursive?: boolean): this;
    
    parent: Object3D | null;
    children: Object3D[];
  }
  
  export class PerspectiveCamera extends Object3D {
    constructor(fov: number, aspect: number, near: number, far: number);
    position: Vector3;
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
  export class Matrix4 {
    elements: number[];
    identity(): this;
    copy(m: Matrix4): this;
    makeRotationFromQuaternion(q: Quaternion): this;
    lookAt(eye: Vector3, target: Vector3, up: Vector3): this;
    multiply(m: Matrix4): this;
    premultiply(m: Matrix4): this;
    invert(): this;
    transpose(): this;
    setPosition(x: number | Vector3, y?: number, z?: number): this;
    scale(v: Vector3): this;
    getMaxScaleOnAxis(): number;
    makeTranslation(x: number, y: number, z: number): this;
    makeRotationX(theta: number): this;
    makeRotationY(theta: number): this;
    makeRotationZ(theta: number): this;
    makeScale(x: number, y: number, z: number): this;
    compose(position: Vector3, quaternion: Quaternion, scale: Vector3): this;
    decompose(position: Vector3, quaternion: Quaternion, scale: Vector3): this;
    determinant(): number;
    fromArray(array: number[], offset?: number): this;
    toArray(array?: number[], offset?: number): number[];
  }
  
  export class Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x?: number, y?: number, z?: number, w?: number);
    set(x: number, y: number, z: number, w: number): this;
    copy(q: Quaternion): this;
    setFromEuler(euler: Euler): this;
    setFromAxisAngle(axis: Vector3, angle: number): this;
    setFromRotationMatrix(m: Matrix4): this;
    multiply(q: Quaternion): this;
    slerp(q: Quaternion, t: number): this;
    equals(q: Quaternion): boolean;
    fromArray(array: number[], offset?: number): this;
    toArray(array?: number[], offset?: number): number[];
  }
  
  export class Euler {
    x: number;
    y: number;
    z: number;
    order: string;
    constructor(x?: number, y?: number, z?: number, order?: string);
    set(x: number, y: number, z: number, order?: string): this;
    copy(euler: Euler): this;
    setFromRotationMatrix(m: Matrix4, order?: string): this;
    setFromQuaternion(q: Quaternion, order?: string): this;
    setFromVector3(v: Vector3, order?: string): this;
    equals(euler: Euler): boolean;
    fromArray(array: number[], offset?: number): this;
    toArray(array?: number[], offset?: number): number[];
  }
  
  export class Vector3 {
    constructor(x?: number, y?: number, z?: number);
    x: number;
    y: number;
    z: number;
    set(x: number, y: number, z: number): this;
    setX(x: number): this;
    setY(y: number): this;
    setZ(z: number): this;
    add(v: Vector3): this;
    addScalar(s: number): this;
    sub(v: Vector3): this;
    subScalar(s: number): this;
    multiply(v: Vector3): this;
    multiplyScalar(s: number): this;
    divide(v: Vector3): this;
    divideScalar(s: number): this;
    min(v: Vector3): this;
    max(v: Vector3): this;
    clamp(min: Vector3, max: Vector3): this;
    negate(): this;
    dot(v: Vector3): number;
    lengthSq(): number;
    length(): number;
    normalize(): this;
    copy(v: Vector3): this;
    clone(): Vector3;
    lerp(v: Vector3, alpha: number): this;
  }
  export const AdditiveBlending: number;
}