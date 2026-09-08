"use client";

import { Html } from "@react-three/drei";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdditiveBlending, Color, type Group, MeshBasicMaterial, type Mesh, type MeshStandardMaterial, type SphereGeometry, Vector3 } from "three";
import type { KnowledgeNodeData, Position3D } from "./types";

interface KnowledgeNodeProps {
  node: KnowledgeNodeData;
  target: Position3D;
  selected: boolean;
  emphasized: boolean;
  dimmed: boolean;
  showLabel: boolean;
  compact: boolean;
  reducedMotion: boolean;
  geometry: SphereGeometry;
  register: (id: string, object: Group | null) => void;
  onSelect: (id: string) => void;
}

export function KnowledgeNode({
  node, target, selected, emphasized, dimmed, showLabel, compact,
  reducedMotion, geometry, register, onSelect,
}: KnowledgeNodeProps) {
  const group = useRef<Group>(null);
  const body = useRef<Group>(null);
  const surface = useRef<MeshStandardMaterial>(null);
  const halo = useRef<MeshBasicMaterial>(null);
  const energyRing = useRef<Mesh>(null);
  const invalidate = useThree((state) => state.invalidate);
  const [hovered, setHovered] = useState(false);
  const destination = useMemo(() => new Vector3(...target), [target]);
  const radius = node.kind === "core" ? 0.47 : node.kind === "subject" ? 0.27 : 0.095 + node.importance * 0.012;
  const scale = selected ? 1.23 : hovered ? 1.14 : emphasized ? 1.07 : 1;
  const brightness = dimmed ? 0.22 : node.status === "not-started" ? 0.35 : 1;
  const tint = useMemo(() => new Color(node.color).multiplyScalar(brightness), [node.color, brightness]);
  const emission = selected ? 0.7 : emphasized ? 0.38 : node.status === "in-progress" ? 0.25 : 0.13;

  useEffect(() => { invalidate(); }, [destination, scale, tint, emission, invalidate]);

  useFrame((_, delta) => {
    if (!group.current || !body.current || !surface.current) return;
    const blend = reducedMotion ? 1 : 1 - Math.exp(-8 * Math.min(delta, 0.06));
    group.current.position.lerp(destination, blend);
    const breathing = !reducedMotion && node.kind !== "topic" && !selected ? 1 + Math.sin(performance.now() * 0.0012 + node.position[0]) * 0.012 : 1;
    const nextScale = body.current.scale.x + (scale * breathing - body.current.scale.x) * blend;
    body.current.scale.setScalar(nextScale);
    surface.current.color.lerp(tint, blend);
    surface.current.emissiveIntensity += (emission - surface.current.emissiveIntensity) * blend;
    if (halo.current) halo.current.opacity += (((selected ? 0.13 : node.kind === "topic" ? 0.025 : 0.055) * (dimmed ? 0.35 : 1)) - halo.current.opacity) * blend;
    if (energyRing.current && !reducedMotion) energyRing.current.rotation.z += delta * (selected ? 0.22 : 0.04);
    if (group.current.position.distanceToSquared(destination) > 0.000001 ||
      Math.abs(nextScale - scale) > 0.001 ||
      Math.abs(surface.current.emissiveIntensity - emission) > 0.001 ||
      Math.abs(surface.current.color.r - tint.r) + Math.abs(surface.current.color.g - tint.g) + Math.abs(surface.current.color.b - tint.b) > 0.001) {
      invalidate();
    } else {
      group.current.position.copy(destination);
      body.current.scale.setScalar(scale * breathing);
    }
  }, -1);

  function select(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    // A drag belongs to the camera, even if it started on a node.
    if (event.delta <= 5) onSelect(node.id);
  }

  return (
    <group ref={(object) => { group.current = object; register(node.id, object); }} position={node.position}>
      <group ref={body}>
        <mesh geometry={geometry} scale={radius * (node.kind === "topic" ? 1.55 : 1.7)} renderOrder={1}>
          <meshBasicMaterial ref={halo} color={node.color} transparent opacity={node.kind === "topic" ? 0.025 : 0.055} blending={AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh
          geometry={geometry}
          scale={radius}
          onClick={select}
          onPointerOver={(event) => { event.stopPropagation(); setHovered(true); }}
          onPointerOut={() => setHovered(false)}
        >
          <meshStandardMaterial
            ref={surface}
            color={tint}
            emissive={node.color}
            emissiveIntensity={emission}
            metalness={0.38}
            roughness={node.status === "completed" ? 0.22 : 0.42}
          />
        </mesh>
        {/* Transparent picking surface increases small nodes' tap targets without extra visual noise. */}
        <mesh geometry={geometry} scale={Math.max(radius * 1.65, 0.25)} onClick={select}>
          <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
        </mesh>
        <group rotation={[0.08, -0.12, Math.PI / 2]}>
          <mesh>
            <torusGeometry args={[radius * 1.48, node.kind === "topic" ? 0.009 : 0.014, 5, 48]} />
            <meshBasicMaterial color={node.color} transparent opacity={dimmed ? 0.08 : 0.2} depthWrite={false} />
          </mesh>
          {node.progress > 0 && (
            <mesh>
              <torusGeometry args={[radius * 1.48, node.kind === "topic" ? 0.012 : 0.023, 5, 48, Math.PI * 2 * node.progress / 100]} />
              <meshBasicMaterial color={node.color} transparent opacity={dimmed ? 0.18 : 0.9} depthWrite={false} />
            </mesh>
          )}
        </group>
        {node.kind === "core" && (
          <group rotation={[0.7, 0.38, -0.35]}>
            <mesh>
              <torusGeometry args={[0.88, 0.011, 5, 64]} />
              <meshBasicMaterial color="#a78bfa" transparent opacity={0.5} depthWrite={false} />
            </mesh>
            <mesh position={[0.88, 0, 0]} geometry={geometry} scale={0.047}>
              <meshBasicMaterial color="#c4b5fd" />
            </mesh>
          </group>
        )}
        {(selected || node.status === "needs-review") && (
          <mesh rotation={[0, 0, Math.PI / 4]} position={[radius * 1.25, radius * 1.25, 0]}>
            <octahedronGeometry args={[selected ? 0.062 : 0.038, 0]} />
            <meshBasicMaterial color={selected ? "#f0f9ff" : "#fbbf24"} />
          </mesh>
        )}
        {selected && <group ref={energyRing} rotation={[0.2, -0.16, 0.1]}>
          <mesh>
            <torusGeometry args={[radius * 1.88, node.kind === "topic" ? 0.014 : 0.022, 6, 64]} />
            <meshBasicMaterial color={node.color} transparent opacity={0.5} blending={AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>}
      </group>
      {showLabel && (
        <Html center position={[0, -radius * (selected ? 2 : 1.65) - 0.22, 0]} zIndexRange={[12, 1]} style={{ pointerEvents: "none" }}>
          <button
            type="button"
            data-node-id={node.id}
            aria-label={`Select ${node.label}`}
            aria-pressed={selected}
            onClick={(event) => { event.stopPropagation(); onSelect(node.id); }}
            style={{
              pointerEvents: "auto", cursor: "pointer", whiteSpace: "nowrap",
              minHeight: 44, minWidth: 44, padding: "5px 8px", borderRadius: 9,
              border: selected ? `1px solid ${node.color}80` : "1px solid transparent",
              background: selected ? "rgba(12, 28, 45, 0.96)" : "rgba(5, 11, 23, 0.78)",
              color: dimmed ? "#8a9ab0" : "#e7f3ff", fontFamily: "var(--font-ui)",
              fontSize: compact ? 10 : 11, lineHeight: 1.35, textAlign: "center",
              boxShadow: selected ? `0 0 20px ${node.color}12` : "none",
            }}
          >
            <span style={{ display: "block", fontWeight: node.kind === "topic" ? 400 : 600 }}>{node.shortLabel ?? node.label}</span>
            {node.kind !== "topic" && <span style={{ display: "block", fontSize: 9, letterSpacing: "0.04em", color: dimmed ? "#728198" : node.color, marginTop: 3 }}>{node.kind === "core" ? "YOUR KNOWLEDGE" : `${node.progress}% COMPLETE`}</span>}
          </button>
        </Html>
      )}
    </group>
  );
}
