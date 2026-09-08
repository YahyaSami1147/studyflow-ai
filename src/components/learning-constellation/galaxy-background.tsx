"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, Line as ThreeLine, LineBasicMaterial, Mesh, Points, ShaderMaterial, SphereGeometry, Vector3, type Group } from "three";

const nebulaVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const nebulaFragment = `
  varying vec2 vUv;
  uniform vec3 colorA;
  uniform vec3 colorB;
  void main() {
    vec2 centered = vUv - 0.5;
    float distanceFromCenter = length(centered * vec2(1.0, 0.7));
    float glow = smoothstep(0.52, 0.02, distanceFromCenter);
    float edge = smoothstep(0.58, 0.25, distanceFromCenter);
    vec3 color = mix(colorB, colorA, smoothstep(0.1, 0.9, vUv.y));
    gl_FragColor = vec4(color, glow * edge * 0.16);
  }
`;

const trailVertex = `
  attribute float aAlpha;
  attribute float aSize;
  varying float vAlpha;
  void main() {
    vAlpha = aAlpha;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = aSize * (280.0 / max(1.0, -viewPosition.z));
  }
`;

const trailFragment = `
  varying float vAlpha;
  void main() {
    float distanceFromCenter = length(gl_PointCoord - 0.5) * 2.0;
    float softness = smoothstep(1.0, 0.12, distanceFromCenter);
    gl_FragColor = vec4(0.72, 0.91, 1.0, softness * vAlpha);
  }
`;

function seededPositions(count: number, seed: number, spread: [number, number, number], depth: [number, number]) {
  const values = new Float32Array(count * 3);
  let state = seed;
  const random = () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
  for (let index = 0; index < values.length; index += 3) {
    values[index] = (random() - 0.5) * spread[0];
    values[index + 1] = (random() - 0.5) * spread[1];
    values[index + 2] = depth[0] - random() * depth[1];
  }
  return values;
}

function StarLayer({ count, seed, color, size, opacity, spread, depth, speed, reducedMotion }: {
  count: number;
  seed: number;
  color: string;
  size: number;
  opacity: number;
  spread: [number, number, number];
  depth: [number, number];
  speed: number;
  reducedMotion: boolean;
}) {
  const group = useRef<Group>(null);
  const positions = useMemo(() => seededPositions(count, seed, spread, depth), [count, depth, seed, spread]);
  const rotation = useRef(0);
  const invalidate = useThree((state) => state.invalidate);

  useFrame((_, delta) => {
    if (reducedMotion || !group.current) return;
    rotation.current += delta * speed;
    group.current.rotation.z = rotation.current;
    group.current.rotation.y = rotation.current * 0.12;
    invalidate();
  });

  return <group ref={group}>
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={size} transparent opacity={opacity} sizeAttenuation depthWrite={false} />
    </points>
  </group>;
}

function NebulaLayer({ position, scale, colors }: { position: [number, number, number]; scale: [number, number, number]; colors: [string, string] }) {
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ colorA: { value: new Color(colors[0]) }, colorB: { value: new Color(colors[1]) } }), [colors]);
  useEffect(() => () => material.current?.dispose(), []);
  return <mesh position={position} scale={scale} renderOrder={-2}>
    <planeGeometry args={[2, 2]} />
    <shaderMaterial ref={material} uniforms={uniforms} vertexShader={nebulaVertex} fragmentShader={nebulaFragment} transparent depthWrite={false} blending={AdditiveBlending} />
  </mesh>;
}

function ShootingStar({ compact, reducedMotion }: { compact: boolean; reducedMotion: boolean }) {
  const line = useRef<ThreeLine<BufferGeometry, LineBasicMaterial>>(null);
  const head = useRef<Mesh>(null);
  const headGlow = useRef<Mesh>(null);
  const trail = useRef<Points<BufferGeometry, ShaderMaterial>>(null);
  const lineGeometry = useMemo(() => {
    const value = new BufferGeometry();
    value.setAttribute("position", new BufferAttribute(new Float32Array(6), 3));
    return value;
  }, []);
  const trailCount = compact ? 8 : 14;
  const trailGeometry = useMemo(() => {
    const value = new BufferGeometry();
    value.setAttribute("position", new BufferAttribute(new Float32Array(trailCount * 3), 3));
    value.setAttribute("aAlpha", new BufferAttribute(new Float32Array(trailCount), 1));
    value.setAttribute("aSize", new BufferAttribute(new Float32Array(trailCount), 1));
    return value;
  }, [trailCount]);
  const trailObject = useMemo(() => {
    const material = new ShaderMaterial({
      vertexShader: trailVertex,
      fragmentShader: trailFragment,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    return new Points(trailGeometry, material);
  }, [trailGeometry]);
  const active = useRef(false);
  const startedAt = useRef(0);
  const start = useRef(new Vector3());
  const direction = useRef(new Vector3());
  const trailDirection = useRef(new Vector3());
  const current = useRef(new Vector3());
  const tail = useRef(new Vector3());
  const particlePosition = useRef(new Vector3());
  const particleSide = useRef(new Vector3());
  const nextTimer = useRef<number | null>(null);
  const invalidate = useThree((state) => state.invalidate);
  const starGeometry = useMemo(() => new SphereGeometry(0.065, 8, 6), []);

  useEffect(() => {
    if (reducedMotion || compact) return;
    const schedule = () => {
      const delay = 4500 + Math.random() * 6500;
      nextTimer.current = window.setTimeout(() => {
        const angle = Math.random() * Math.PI * 2;
        start.current.set((Math.random() - 0.5) * 18, 4 + Math.random() * 5, -4 - Math.random() * 5);
        direction.current.set(Math.cos(angle) * 3.8, -1.4 - Math.random() * 1.1, 0.1);
        trailDirection.current.copy(direction.current).normalize();
        startedAt.current = performance.now();
        active.current = true;
        schedule();
        invalidate();
      }, delay);
    };
    schedule();
    return () => { if (nextTimer.current !== null) window.clearTimeout(nextTimer.current); };
  }, [compact, invalidate, reducedMotion]);

  useFrame(() => {
    if (!active.current || reducedMotion || compact || !line.current || !head.current || !headGlow.current || !trail.current) return;
    const elapsed = (performance.now() - startedAt.current) / 1000;
    const life = Math.min(elapsed / 1.2, 1);
    if (life >= 1) {
      active.current = false;
      line.current.visible = false;
      head.current.visible = false;
      headGlow.current.visible = false;
      trail.current.visible = false;
      return;
    }
    current.current.copy(start.current).addScaledVector(direction.current, life);
    tail.current.copy(current.current).addScaledVector(direction.current, -0.95);
    const positions = line.current.geometry.getAttribute("position") as BufferAttribute;
    positions.setXYZ(0, tail.current.x, tail.current.y, tail.current.z);
    positions.setXYZ(1, current.current.x, current.current.y, current.current.z);
    positions.needsUpdate = true;
    line.current.visible = true;
    line.current.material.opacity = Math.pow(1 - life, 1.35) * 0.58;
    head.current.visible = true;
    head.current.position.copy(current.current);
    headGlow.current.visible = true;
    headGlow.current.position.copy(current.current);
    headGlow.current.scale.setScalar(1 + Math.sin(elapsed * 9) * 0.08);
    const trailPositions = trail.current.geometry.getAttribute("position") as BufferAttribute;
    const trailAlpha = trail.current.geometry.getAttribute("aAlpha") as BufferAttribute;
    const trailSize = trail.current.geometry.getAttribute("aSize") as BufferAttribute;
    particleSide.current.set(-trailDirection.current.y, trailDirection.current.x, 0).normalize();
    for (let index = 0; index < trailCount; index += 1) {
      const particleAge = elapsed - index * 0.035;
      const particleLife = particleAge / 0.58;
      if (particleAge < 0 || particleLife >= 1) {
        trailAlpha.setX(index, 0);
        continue;
      }
      const drift = Math.sin(index * 9.17) * 0.045 * particleLife;
      particlePosition.current.copy(current.current).addScaledVector(trailDirection.current, -(0.16 + particleLife * 1.2));
      particlePosition.current.addScaledVector(particleSide.current, drift);
      trailPositions.setXYZ(index, particlePosition.current.x, particlePosition.current.y, particlePosition.current.z);
      trailAlpha.setX(index, Math.pow(1 - particleLife, 1.65) * 0.72);
      trailSize.setX(index, (1 - particleLife) * 0.12);
    }
    trailPositions.needsUpdate = true;
    trailAlpha.needsUpdate = true;
    trailSize.needsUpdate = true;
    trail.current.visible = true;
    invalidate();
  });

  useEffect(() => () => { lineGeometry.dispose(); trailGeometry.dispose(); starGeometry.dispose(); trailObject.material.dispose(); }, [lineGeometry, starGeometry, trailGeometry, trailObject]);
  const lineObject = useMemo(() => {
    const material = new LineBasicMaterial({ color: "#d9f7ff", transparent: true, opacity: 0.65, blending: AdditiveBlending, depthWrite: false });
    return new ThreeLine(lineGeometry, material);
  }, [lineGeometry]);
  useEffect(() => () => lineObject.material.dispose(), [lineObject]);
  return <group>
    <primitive ref={line} object={lineObject} visible={false} frustumCulled={false} />
    <primitive ref={trail} object={trailObject} visible={false} frustumCulled={false} />
    <mesh ref={head} geometry={starGeometry} visible={false}>
      <meshBasicMaterial color="#ffffff" transparent opacity={0.9} blending={AdditiveBlending} depthWrite={false} />
    </mesh>
    <mesh ref={headGlow} geometry={starGeometry} scale={2.25} visible={false}>
      <meshBasicMaterial color="#8eeaff" transparent opacity={0.18} blending={AdditiveBlending} depthWrite={false} />
    </mesh>
  </group>;
}

export function GalaxyBackground({ compact, reducedMotion }: { compact: boolean; reducedMotion: boolean }) {
  return <>
    <NebulaLayer position={[0, 0, -16]} scale={[25, 15, 1]} colors={["#14314b", "#0b1830"]} />
    <NebulaLayer position={[-5, 2, -12]} scale={[13, 8, 1]} colors={["#1a2d52", "#0c1a2d"]} />
    <StarLayer count={compact ? 48 : 110} seed={771} color="#d5e9fa" size={0.028} opacity={0.62} spread={[30, 22, 1]} depth={[5, 11]} speed={0.0015} reducedMotion={reducedMotion} />
    <StarLayer count={compact ? 26 : 65} seed={1193} color="#8ac8ed" size={0.045} opacity={0.42} spread={[25, 18, 1]} depth={[1, 8]} speed={-0.0025} reducedMotion={reducedMotion} />
    <StarLayer count={compact ? 14 : 32} seed={4481} color="#c4b5fd" size={0.07} opacity={0.24} spread={[18, 14, 1]} depth={[0, 5]} speed={0.004} reducedMotion={reducedMotion} />
    <ShootingStar compact={compact} reducedMotion={reducedMotion} />
  </>;
}
