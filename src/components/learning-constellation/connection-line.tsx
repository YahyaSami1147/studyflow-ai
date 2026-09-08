"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { BufferAttribute, BufferGeometry, Line, LineBasicMaterial, type Group } from "three";

interface ConnectionLineProps {
  from: string;
  to: string;
  objects: RefObject<Map<string, Group>>;
  color: string;
  active: boolean;
  subdued: boolean;
  related?: boolean;
  reducedMotion: boolean;
}

export function ConnectionLine({ from, to, objects, color, active, subdued, related = false, reducedMotion }: ConnectionLineProps) {
  const invalidate = useThree((state) => state.invalidate);
  const renderedLine = useRef<Line<BufferGeometry, LineBasicMaterial>>(null);
  const line = useMemo(() => {
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(new Float32Array(6), 3));
    const material = new LineBasicMaterial({ transparent: true, depthWrite: false, opacity: 0.16 });
    const object = new Line(geometry, material);
    object.frustumCulled = false;
    return object;
  }, []);
  const opacity = active ? (related ? 0.42 : 0.72) : subdued ? 0.055 : related ? 0.085 : 0.24;

  useEffect(() => { line.material.color.set(color); invalidate(); }, [line, color, opacity, invalidate]);
  useEffect(() => () => { line.geometry.dispose(); line.material.dispose(); }, [line]);

  useFrame((_, delta) => {
    const start = objects.current.get(from);
    const end = objects.current.get(to);
    const current = renderedLine.current;
    if (!start || !end || !current) return;
    const positions = current.geometry.getAttribute("position") as BufferAttribute;
    positions.setXYZ(0, start.position.x, start.position.y, start.position.z);
    positions.setXYZ(1, end.position.x, end.position.y, end.position.z);
    positions.needsUpdate = true;
    const blend = reducedMotion ? 1 : 1 - Math.exp(-7 * Math.min(delta, 0.06));
    current.material.opacity += (opacity - current.material.opacity) * blend;
    if (Math.abs(opacity - current.material.opacity) > 0.001) invalidate();
    else current.material.opacity = opacity;
  });

  return <primitive ref={renderedLine} object={line} />;
}
