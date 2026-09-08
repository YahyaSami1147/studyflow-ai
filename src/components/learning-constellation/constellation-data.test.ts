import { describe, expect, it } from "vitest";
import {
  constellationNodes,
  getRelatedNodes,
  getSubjectId,
  matchesFilter,
} from "./constellation-data";
import type { KnowledgeNodeData, NodeStatus } from "./types";

function node(id: string): KnowledgeNodeData {
  const match = constellationNodes.find((candidate) => candidate.id === id);
  if (!match) throw new Error(`Missing constellation node: ${id}`);
  return match;
}

describe("learning constellation sample graph", () => {
  it("keeps every topic reachable from the core without broken relationship ids", () => {
    const ids = new Set(constellationNodes.map((candidate) => candidate.id));
    expect(ids.size).toBe(constellationNodes.length);
    expect(constellationNodes.filter((candidate) => candidate.kind === "core")).toHaveLength(1);

    for (const candidate of constellationNodes) {
      if (candidate.kind === "subject") {
        expect(candidate.parentId).toBe("core");
        expect(constellationNodes.filter((topic) => topic.parentId === candidate.id)).toHaveLength(4);
      }
      if (candidate.kind === "topic") {
        expect(node(getSubjectId(candidate)).kind).toBe("subject");
      }
      for (const relatedId of candidate.relatedIds) {
        expect(ids.has(relatedId), `${candidate.id} references ${relatedId}`).toBe(true);
        expect(relatedId).not.toBe(candidate.id);
      }
      expect(candidate.progress).toBeGreaterThanOrEqual(0);
      expect(candidate.progress).toBeLessThanOrEqual(100);
      expect(candidate.mastery).toBeGreaterThanOrEqual(0);
      expect(candidate.mastery).toBeLessThanOrEqual(100);
    }
  });

  it("keeps overview completion consistent with the topics shown in its detail panel", () => {
    for (const subject of constellationNodes.filter((candidate) => candidate.kind === "subject")) {
      const children = constellationNodes.filter((candidate) => candidate.parentId === subject.id);
      const meanProgress = Math.round(children.reduce((sum, child) => sum + child.progress, 0) / children.length);
      expect(subject.progress).toBe(meanProgress);
    }
    expect(node("mathematics").progress).toBe(72);
    expect(node("mathematics").mastery).toBeGreaterThanOrEqual(75);
    expect(constellationNodes.filter((candidate) => candidate.parentId === "mathematics" && candidate.status === "needs-review")).toHaveLength(2);
  });

  it("lets a topic reveal its parent and incoming as well as outgoing conceptual connections", () => {
    const probabilityRelations = getRelatedNodes(node("probability"), constellationNodes).map((candidate) => candidate.id);
    expect(probabilityRelations).toEqual(expect.arrayContaining(["mathematics", "statistics", "neural-networks"]));
    expect(probabilityRelations).not.toContain("probability");
    expect(probabilityRelations).not.toContain("electromagnetism");

    // NLP references Neural Networks; that connection must be explorable in both directions.
    expect(getRelatedNodes(node("neural-networks"), constellationNodes).map((candidate) => candidate.id)).toContain("nlp");
  });

  it("provides meaningful results for every status filter", () => {
    const statuses: NodeStatus[] = ["completed", "in-progress", "needs-review", "not-started"];
    for (const status of statuses) {
      const matches = constellationNodes.filter((candidate) => matchesFilter(candidate, status));
      expect(matches.length).toBeGreaterThan(0);
      expect(matches.every((candidate) => candidate.status === status)).toBe(true);
    }
    expect(constellationNodes.filter((candidate) => matchesFilter(candidate, "all"))).toHaveLength(constellationNodes.length);
  });
});
