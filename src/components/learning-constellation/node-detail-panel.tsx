import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Circle, CircleDashed, Sparkles, RotateCcw } from "lucide-react";
import { getRelatedNodes, statusLabels } from "./constellation-data";
import type { KnowledgeNodeData, NodeStatus } from "./types";
import styles from "./constellation.module.css";

export function StatusIcon({ status, size = 15 }: { status: NodeStatus; size?: number }) {
  const Icon = status === "completed" ? CheckCircle2 : status === "needs-review" ? RotateCcw : status === "in-progress" ? CircleDashed : Circle;
  return <Icon size={size} aria-hidden="true" />;
}

export function NodeDetailPanel({ node, nodes, onSelect }: { node?: KnowledgeNodeData; nodes: KnowledgeNodeData[]; onSelect: (id: string) => void }) {
  const topics = nodes.filter((item) => item.kind === "topic");
  const activeNode = node ?? nodes.find((item) => item.kind === "core");
  const progress = activeNode?.progress ?? Math.round(topics.reduce((sum, item) => sum + item.progress, 0) / Math.max(topics.length, 1));
  const related = activeNode ? getRelatedNodes(activeNode, nodes).filter((item) => item.kind !== "core").slice(0, 5) : [];
  const reviewCount = nodes.filter((item) => item.parentId === activeNode?.id && item.status === "needs-review").length;
  return <aside className={styles.detail} aria-label="Selected knowledge">
    <div className={styles.detailHeading}>
      <span className={styles.nodeIcon} style={{ color: activeNode?.color ?? "var(--brand)" }}><BookOpen size={22} aria-hidden="true" /></span>
      <span className={styles.eyebrow}>{activeNode ? activeNode.kind === "core" ? "Knowledge core" : activeNode.kind === "subject" ? "Course insight" : activeNode.subject : "The bigger picture"}</span>
    </div>
    <h2>{activeNode?.kind === "core" ? "Your learning" : activeNode?.label ?? "Your learning"}</h2>
    <p className={styles.description}>{activeNode?.description ?? "Your learning map will appear here as you add courses, assignments, or tasks."}</p>
    <div className={styles.progressHeading}><span>Learning progress</span><strong>{progress}<small>%</small></strong></div>
    <div className={styles.progressTrack} role="progressbar" aria-label="Learning progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%`, background: activeNode?.color }} /></div>
    {activeNode ? <>
      <dl className={styles.facts}>
        <div><dt>Mastery</dt><dd>{activeNode.mastery === null ? "Not available yet" : activeNode.mastery >= 75 ? "Strong" : activeNode.mastery >= 45 ? "Developing" : "Building"}<span>{activeNode.mastery === null ? "No confidence data stored" : `${activeNode.mastery}% confidence`}</span></dd></div>
        <div><dt>Status</dt><dd><span className={styles.status}><StatusIcon status={activeNode.status} />{statusLabels[activeNode.status]}</span></dd></div>
      </dl>
      {activeNode.kind !== "topic" && <p className={styles.reviewNote}>{reviewCount ? `${reviewCount} topic${reviewCount === 1 ? " needs" : "s need"} review` : `${topics.filter((item) => item.status === "completed").length} topics completed`}</p>}
    </> : null}
    <div className={styles.nextStep}>
      <p className={styles.eyebrow}><Sparkles size={14} aria-hidden="true" />Recommended next step</p>
      <p>{activeNode?.nextStep ?? "Add a course, assignment, or task to start building your constellation."}</p>
      <Link href="/ai">Open study assistant <ArrowRight size={15} aria-hidden="true" /></Link>
    </div>
    {related.length > 0 && <div className={styles.related}><h3>Connected knowledge</h3>
      {related.slice(0, 5).map((item) => <button type="button" key={item.id} onClick={() => onSelect(item.id)}><span><StatusIcon status={item.status} />{item.label}</span><ArrowRight size={14} aria-hidden="true" /></button>)}
    </div>}
  </aside>;
}
