import { statusLabels } from "./constellation-data";
import type { KnowledgeNodeData } from "./types";
import styles from "./constellation.module.css";

function ConstellationIllustration() {
  return <svg className={styles.illustration} viewBox="0 0 420 200" fill="none" aria-hidden="true">
    <g stroke="#38bdf8" strokeOpacity=".3"><path d="M210 102 110 52 53 83M110 52 142 18M210 102 313 46 374 70M313 46 326 12M210 102 309 152 369 131M309 152 319 192M210 102 127 156 59 137M127 156 144 189" /><path d="m110 52 17 104 182-4 4-106" strokeDasharray="3 8" /></g>
    <circle cx="210" cy="102" r="29" stroke="#38bdf8" strokeOpacity=".18" /><circle cx="210" cy="102" r="20" stroke="#38bdf8" strokeOpacity=".5" /><circle cx="210" cy="102" r="10" fill="#67e8f9" />
    {[[110, 52], [313, 46], [309, 152], [127, 156]].map(([x, y], i) => <g key={x}><circle cx={x} cy={y} r="15" stroke={i % 2 ? "#a78bfa" : "#38bdf8"} strokeOpacity=".3" /><circle cx={x} cy={y} r="5" fill={i % 2 ? "#a78bfa" : "#38bdf8"} /></g>)}
    {[[53, 83], [142, 18], [374, 70], [326, 12], [369, 131], [319, 192], [59, 137], [144, 189]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="#aebed2" />)}
  </svg>;
}

export function ConstellationFallback({ loading = false, nodes = [], selectedId, onSelect, failure = false }: {
  loading?: boolean;
  nodes?: KnowledgeNodeData[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  failure?: boolean;
}) {
  return <div className={`${styles.fallback} ${loading ? styles.loading : ""}`}>
    <ConstellationIllustration />
    <div role={loading ? "status" : undefined}>
      <h2>{loading ? "Building your learning constellation…" : "Explore your knowledge in 2D"}</h2>
      <p>{loading ? "Connecting the dots in your learning journey." : failure ? "The 3D view is unavailable. Your progress and topic insights are all here." : "The same knowledge, at a glance. Select a course to explore."}</p>
    </div>
    {!loading && <div className={styles.fallbackSubjects}>{nodes.filter((node) => node.kind === "subject").map((node) => <button key={node.id} type="button" onClick={() => onSelect?.(node.id)} aria-pressed={selectedId === node.id}>
      <span style={{ color: node.color }}>{node.label}</span><strong>{node.progress}%</strong><small>{statusLabels[node.status]}</small>
    </button>)}</div>}
  </div>;
}
