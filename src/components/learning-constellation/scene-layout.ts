import type { KnowledgeNodeData, Position3D } from "./types";

/** Keep the camera, node transforms, and relationship endpoints on one layout. */
export function nodePosition(
  node: KnowledgeNodeData,
  nodes: KnowledgeNodeData[],
  activeSubject: string | null,
): Position3D {
  if (node.kind !== "topic" || node.parentId !== activeSubject) return node.position;
  const parent = nodes.find((candidate) => candidate.id === node.parentId);
  if (!parent) return node.position;
  return node.position.map((value, axis) =>
    parent.position[axis] + (value - parent.position[axis]) * 1.4,
  ) as Position3D;
}

export function subjectFor(node: KnowledgeNodeData | undefined): string | null {
  if (!node || node.kind === "core") return null;
  return node.kind === "subject" ? node.id : node.parentId;
}
