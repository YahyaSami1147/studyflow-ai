"use client";

import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, type ComponentRef } from "react";
import { Vector3 } from "three";
import { nodePosition, subjectFor } from "./scene-layout";
import type { KnowledgeNodeData } from "./types";

interface CameraProps {
  nodes: KnowledgeNodeData[];
  selectedId: string | null;
  resetKey: number;
  compact: boolean;
  reducedMotion: boolean;
  enabled: boolean;
}

export function ConstellationCamera({ nodes, selectedId, resetKey, compact, reducedMotion, enabled }: CameraProps) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const { camera, gl, invalidate, size } = useThree();
  const eventSurface = useThree((state) => state.events.connected);
  const transition = useRef({ active: false, target: new Vector3(), position: new Vector3() });
  const lastInteraction = useRef(0);
  const idleBase = useRef(new Vector3());
  const idleOffset = useRef(new Vector3());
  const idleStarted = useRef(false);

  useEffect(() => {
    lastInteraction.current = performance.now();
  }, []);

  useEffect(() => {
    // OrbitControls sets touch-action on connect even while disabled. Restore page scrolling
    // on both the event surface and canvas until the mobile user opts into exploration.
    gl.domElement.style.setProperty("touch-action", enabled ? "none" : "pan-y");
    if (eventSurface instanceof HTMLElement) eventSurface.style.setProperty("touch-action", enabled ? "none" : "pan-y");
  }, [enabled, eventSurface, gl]);

  function recordView() {
    if (!controls.current) return;
    // Settled poses support browser verification without a global renderer/debug handle.
    gl.domElement.setAttribute("data-camera-position", camera.position.toArray().map((n) => n.toFixed(3)).join(","));
    gl.domElement.setAttribute("data-camera-target", controls.current.target.toArray().map((n) => n.toFixed(3)).join(","));
  }

  useEffect(() => {
    const orbit = controls.current;
    if (!orbit) return;
    const selected = nodes.find((node) => node.id === selectedId);
    const subject = subjectFor(selected);
    const center = new Vector3();
    let distance: number;
    const aspect = size.width / Math.max(size.height, 1);
    const halfFov = Math.tan(42 * Math.PI / 360);
    if (selected && subject) {
      const parent = nodes.find((node) => node.id === subject) ?? selected;
      center.fromArray(parent.position);
      if (selected.kind === "topic") center.lerp(new Vector3(...nodePosition(selected, nodes, subject)), 0.32);
      const cluster = nodes.filter((node) => node.id === subject || node.parentId === subject).map((node) => nodePosition(node, nodes, subject));
      const width = Math.max(...cluster.map((point) => Math.abs(point[0] - center.x))) * 2 + 1.9;
      const height = Math.max(...cluster.map((point) => Math.abs(point[1] - center.y))) * 2 + 1.7;
      distance = Math.max(8.4, width / (2 * halfFov * aspect), height / (2 * halfFov));
    } else {
      const width = Math.max(...nodes.map((node) => Math.abs(node.position[0]))) * 2 + 4.2;
      const height = Math.max(...nodes.map((node) => Math.abs(node.position[1]))) * 2 + 4.4;
      distance = Math.max(width / (2 * halfFov * aspect), height / (2 * halfFov), 12.5);
      center.y = 0.1;
    }
    distance = Math.min(54, distance * (compact ? 1.18 : 1));
    // A consistent front-facing focus keeps concept labels readable, then yields to manual orbit.
    transition.current.target.copy(center);
    transition.current.position.copy(center).add(new Vector3(0.35, 0.7, distance));
    transition.current.active = true;
    lastInteraction.current = performance.now();
    idleStarted.current = false;
    orbit.enableDamping = false;
    gl.domElement.setAttribute("data-camera-moving", reducedMotion ? "false" : "true");
    invalidate();
  }, [selectedId, resetKey, nodes, compact, reducedMotion, camera, gl, invalidate, size.width, size.height]);

  useFrame((_, delta) => {
    const orbit = controls.current;
    const next = transition.current;
    if (!orbit || !next.active) return;
    const blend = reducedMotion ? 1 : 1 - Math.exp(-6 * Math.min(delta, 0.06));
    camera.position.lerp(next.position, blend);
    orbit.target.lerp(next.target, blend);
    orbit.update();
    if (camera.position.distanceToSquared(next.position) > 0.00001 || orbit.target.distanceToSquared(next.target) > 0.00001) {
      invalidate();
    } else {
      camera.position.copy(next.position);
      orbit.target.copy(next.target);
      orbit.update();
      next.active = false;
      orbit.enableDamping = !reducedMotion;
      gl.domElement.setAttribute("data-camera-moving", "false");
      recordView();
    }
  }, -2);

  useFrame((_, delta) => {
    const orbit = controls.current;
    if (!orbit || transition.current.active) return;
    if (!reducedMotion && !compact && enabled && performance.now() - lastInteraction.current > 3600) {
      if (!idleStarted.current) {
        idleBase.current.copy(camera.position);
        idleStarted.current = true;
      }
      idleOffset.current.copy(idleBase.current).sub(orbit.target);
      idleOffset.current.applyAxisAngle(new Vector3(0, 1, 0), Math.sin(performance.now() * 0.00022) * 0.012);
      camera.position.lerp(idleOffset.current.add(orbit.target), 1 - Math.exp(-0.7 * delta));
      orbit.update();
      invalidate();
    }
    recordView();
  }, -1);

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enabled={enabled}
      enablePan={false}
      enableDamping={!reducedMotion}
      dampingFactor={0.12}
      minDistance={5}
      maxDistance={54}
      minPolarAngle={Math.PI * 0.28}
      maxPolarAngle={Math.PI * 0.7}
      minAzimuthAngle={-Math.PI * 0.42}
      maxAzimuthAngle={Math.PI * 0.42}
      rotateSpeed={0.45}
      zoomSpeed={0.7}
      onStart={() => {
        transition.current.active = false;
        lastInteraction.current = performance.now();
        idleStarted.current = false;
        if (controls.current) controls.current.enableDamping = !reducedMotion;
        gl.domElement.setAttribute("data-camera-moving", "false");
      }}
      onChange={recordView}
      onEnd={() => {
        lastInteraction.current = performance.now();
        idleStarted.current = false;
        recordView();
      }}
    />
  );
}
