import { RotateCcw, Layers2, Orbit } from "lucide-react";
import type { ConstellationFilter, KnowledgeNodeData } from "./types";
import styles from "./constellation.module.css";

const filters: { value: ConstellationFilter; label: string }[] = [
  { value: "all", label: "All topics" },
  { value: "in-progress", label: "In progress" },
  { value: "needs-review", label: "Needs review" },
  { value: "completed", label: "Completed" },
];

export function ConstellationControls({ filter, onFilter, onReset, staticView, onToggleView, nodes }: {
  filter: ConstellationFilter;
  onFilter: (filter: ConstellationFilter) => void;
  onReset: () => void;
  staticView: boolean;
  onToggleView: () => void;
  nodes: KnowledgeNodeData[];
}) {
  return <div className={styles.controls}>
    <div className={styles.filters} role="group" aria-label="Filter topics">
      {filters.map(({ value, label }) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => onFilter(value)}>
        {label}<span>{nodes.filter((node) => node.kind === "topic" && (value === "all" || node.status === value)).length}</span>
      </button>)}
    </div>
    <div className={styles.viewControls}>
      <button type="button" onClick={onToggleView}>{staticView ? <Orbit size={15} aria-hidden="true" /> : <Layers2 size={15} aria-hidden="true" />}{staticView ? "3D view" : "2D view"}</button>
      <button type="button" onClick={onReset}><RotateCcw size={15} aria-hidden="true" />Reset view</button>
    </div>
  </div>;
}
