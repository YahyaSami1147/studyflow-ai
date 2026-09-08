"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { SphereGeometry, WebGLRenderer, type Group } from "three";
import { ConnectionLine } from "./connection-line";
import { ConstellationCamera } from "./constellation-camera";
import { GalaxyBackground } from "./galaxy-background";
import { KnowledgeNode } from "./knowledge-node";
import { nodePosition, subjectFor } from "./scene-layout";
import type { ConstellationSceneProps } from "./types";

function SceneHealth({ onReady, onError }: Pick<ConstellationSceneProps, "onReady" | "onError">) {
  const gl = useThree((state) => state.gl);
  const scheduled = useRef(false);
  const readyFrame = useRef<number | null>(null);

  useEffect(() => {
    const canvas = gl.domElement;
    function contextLost(event: Event) { event.preventDefault(); onError(); }
    canvas.addEventListener("webglcontextlost", contextLost);
    return () => {
      canvas.removeEventListener("webglcontextlost", contextLost);
      if (readyFrame.current !== null) cancelAnimationFrame(readyFrame.current);
      scheduled.current = false;
    };
  }, [gl, onError]);

  useFrame(() => {
    if (scheduled.current) return;
    scheduled.current = true;
    readyFrame.current = requestAnimationFrame(() => {
      gl.domElement.setAttribute("data-ready", "true");
      onReady();
    });
  });
  return null;
}

function SpatialDust({ compact }: { compact: boolean }) {
  const positions = useMemo(() => {
    const values = new Float32Array((compact ? 85 : 180) * 3);
    let seed = 4128;
    const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < values.length; i += 3) {
      values[i] = (random() - 0.5) * 30;
      values[i + 1] = (random() - 0.5) * 22;
      values[i + 2] = -2 - random() * 11;
    }
    return values;
  }, [compact]);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#b4cce5" size={0.035} transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function KnowledgeGraph(props: ConstellationSceneProps) {
  const { nodes, selectedId, filter, reducedMotion, compact, onSelect } = props;
  const objects = useRef(new Map<string, Group>());
  const reveal = useRef<Group>(null);
  const revealProgress = useRef(0);
  const invalidate = useThree((state) => state.invalidate);
  const geometry = useMemo(() => new SphereGeometry(1, compact ? 16 : 24, compact ? 12 : 16), [compact]);
  const register = useCallback((id: string, object: Group | null) => {
    if (object) objects.current.set(id, object);
    else objects.current.delete(id);
  }, [objects]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    if (!reveal.current || reducedMotion) return;
    revealProgress.current = Math.min(1, revealProgress.current + delta / 1.15);
    const eased = 1 - Math.pow(1 - revealProgress.current, 3);
    reveal.current.scale.setScalar(0.985 + eased * 0.015);
    if (revealProgress.current < 1) invalidate();
  }, -3);

  const selected = nodes.find((node) => node.id === selectedId);
  const activeSubject = subjectFor(selected);
  const clusterIds = useMemo(() => new Set(nodes.filter((node) => node.id === activeSubject || node.parentId === activeSubject).map((node) => node.id)), [nodes, activeSubject]);
  const relatedIds = useMemo(() => new Set(selected?.relatedIds ?? []), [selected]);
  const targets = useMemo(() => new Map(nodes.map((node) => [node.id, nodePosition(node, nodes, activeSubject)])), [nodes, activeSubject]);
  const edges = useMemo(() => {
    const relationships: { from: string; to: string; color: string; related: boolean }[] = [];
    const seen = new Set<string>();
    for (const node of nodes) {
      if (node.parentId) relationships.push({ from: node.parentId, to: node.id, color: node.color, related: false });
      for (const id of node.relatedIds) {
        const other = nodes.find((candidate) => candidate.id === id);
        // Cross-subject bridges add useful context without duplicating the parent network.
        if (!other || node.parentId === other.parentId || other.parentId === node.id || node.parentId === other.id) continue;
        const key = [node.id, id].sort().join(":");
        if (seen.has(key)) continue;
        seen.add(key);
        relationships.push({ from: node.id, to: id, color: "#98a5cf", related: true });
      }
    }
    return relationships;
  }, [nodes]);

  return (
    <>
      <color attach="background" args={["#060e1d"]} />
      <fog attach="fog" args={["#060e1d", 24, 58]} />
      <group ref={reveal} scale={reducedMotion ? 1 : 0.985}>
      <GalaxyBackground compact={compact} reducedMotion={reducedMotion} />
      <hemisphereLight args={["#a8daff", "#111427", 1.7]} />
      <directionalLight position={[-3, 7, 8]} color="#d2f2ff" intensity={2.4} />
      <pointLight position={[4, -2, 4]} color="#9b8bff" intensity={14} distance={18} decay={2} />
      <SpatialDust compact={compact} />
      {edges.map((edge) => (
        <ConnectionLine
          key={`${edge.from}-${edge.to}`}
          {...edge}
          objects={objects}
          active={edge.related ? edge.from === selectedId || edge.to === selectedId : clusterIds.has(edge.to)}
          subdued={Boolean(activeSubject) && !clusterIds.has(edge.to)}
          reducedMotion={reducedMotion}
        />
      ))}
      {nodes.map((node) => {
        const inCluster = clusterIds.has(node.id);
        const filtered = filter !== "all" && node.kind === "topic" && node.status !== filter;
        return (
          <KnowledgeNode
            key={node.id}
            node={node}
            target={targets.get(node.id) ?? node.position}
            selected={selectedId === node.id}
            emphasized={inCluster || relatedIds.has(node.id)}
            dimmed={filtered || Boolean(activeSubject && !inCluster && !relatedIds.has(node.id) && node.kind !== "core")}
            showLabel={node.kind !== "topic" || inCluster}
            compact={compact}
            reducedMotion={reducedMotion}
            geometry={geometry}
            register={register}
            onSelect={onSelect}
          />
        );
      })}
      <ConstellationCamera nodes={nodes} selectedId={selectedId} resetKey={props.resetKey} compact={compact} reducedMotion={reducedMotion} enabled={props.interactionEnabled} />
      <SceneHealth onReady={props.onReady} onError={props.onError} />
      </group>
    </>
  );
}

export default function ConstellationScene(props: ConstellationSceneProps) {
  return (
    <div
      data-testid="constellation-webgl"
      data-selected-node={props.selectedId ?? "all"}
      data-motion={props.reducedMotion ? "reduced" : "full"}
      style={{ width: "100%", height: "100%" }}
    >
      <Canvas
        frameloop="demand"
        dpr={[1, props.compact ? 1.25 : 1.5]}
        camera={{ position: [0.35, 0.8, props.compact ? 24 : 19], fov: 42, near: 0.1, far: 90 }}
        gl={(defaults) => new WebGLRenderer({ ...defaults, antialias: true, alpha: false, powerPreference: "default" })}
        style={{ touchAction: props.interactionEnabled ? "none" : "pan-y" }}
      >
        <KnowledgeGraph {...props} />
      </Canvas>
    </div>
  );
}
