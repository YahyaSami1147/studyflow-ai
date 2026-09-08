export type NodeStatus = "completed" | "in-progress" | "needs-review" | "not-started";
export type ConstellationFilter = "all" | NodeStatus;
export type Position3D = [number, number, number];

export interface KnowledgeNodeData {
  id: string;
  label: string;
  shortLabel?: string;
  kind: "core" | "subject" | "topic";
  subject: string;
  parentId: string | null;
  progress: number;
  mastery: number | null;
  status: NodeStatus;
  position: Position3D;
  importance: number;
  color: string;
  description: string;
  nextStep: string;
  relatedIds: string[];
}

export interface ConstellationSceneProps {
  nodes: KnowledgeNodeData[];
  selectedId: string | null;
  filter: ConstellationFilter;
  onSelect: (id: string) => void;
  resetKey: number;
  reducedMotion: boolean;
  compact: boolean;
  interactionEnabled: boolean;
  onReady: () => void;
  onError: () => void;
}
