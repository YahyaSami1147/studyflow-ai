"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ArrowRight, Hand, Network, Sparkles } from "lucide-react";
import { getSubjectId, matchesFilter, statusLabels } from "./constellation-data";
import { buildConstellationFromStudyData } from "./constellation-data-adapter";
import { ConstellationControls } from "./constellation-controls";
import { ConstellationFallback } from "./constellation-fallback";
import { NodeDetailPanel, StatusIcon } from "./node-detail-panel";
import { SceneErrorBoundary } from "./scene-error-boundary";
import type { ConstellationFilter, KnowledgeNodeData } from "./types";
import { useStudyFlow } from "@/providers/studyflow-provider";
import styles from "./constellation.module.css";

// Keep all Three/R3F imports behind this client-only boundary, including in 2D mode.
const ConstellationScene = dynamic(() => import("./constellation-scene"), { ssr: false, loading: () => null });

function useMediaQuery(query: string, serverValue = false) {
  const subscribe = useCallback((callback: () => void) => {
    const media = window.matchMedia(query);
    media.addEventListener("change", callback);
    return () => media.removeEventListener("change", callback);
  }, [query]);
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => serverValue);
}

export function LearningConstellation({ nodes: providedNodes }: { nodes?: KnowledgeNodeData[] }) {
  const { data, isHydrated } = useStudyFlow();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ConstellationFilter>("all");
  const [resetKey, setResetKey] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null);
  const [view2D, setView2D] = useState(false);
  const [touchExploration, setTouchExploration] = useState(false);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)", true);
  const compact = useMediaQuery("(max-width: 767px), (pointer: coarse)", true);
  const nodes = useMemo(() => providedNodes ?? (isHydrated ? buildConstellationFromStudyData(data) : []), [data, isHydrated, providedNodes]);
  const selected = nodes.find((node) => node.id === selectedId);
  const subjectId = selected ? getSubjectId(selected) : null;
  const subjects = nodes.filter((node) => node.kind === "subject");
  const topics = nodes.filter((node) => node.kind === "topic");
  const staticView = view2D || failed || webglAvailable === false;
  const visibleTopics = topics.filter((node) => (!subjectId || subjectId === "core" || node.parentId === subjectId) && matchesFilter(node, filter));
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => { setFailed(true); setReady(false); setTouchExploration(false); }, []);
  const onSelect = useCallback((id: string) => {
    const node = nodes.find((item) => item.id === id);
    if (!node) return;
    setSelectedId(id);
    if (node.kind === "topic" && !matchesFilter(node, filter)) setFilter("all");
  }, [filter, nodes]);
  const onReset = useCallback(() => {
    setSelectedId(null);
    setFilter("all");
    setResetKey((key) => key + 1);
    setTouchExploration(false);
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const canvas = document.createElement("canvas");
        setWebglAvailable(Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl")));
      } catch {
        setWebglAvailable(false);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => { if (event.key === "Escape") onReset(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onReset]);

  function toggleView() {
    setView2D(!staticView);
    setFailed(false);
    setReady(false);
    setTouchExploration(false);
    setResetKey((key) => key + 1);
  }

  const fallback = <ConstellationFallback nodes={nodes} selectedId={selectedId} onSelect={onSelect} failure={failed} />;

  return <div className={styles.workspace}>
    <header className={styles.header}>
      <div className={styles.headerTop}><p className={styles.eyebrow}><Network size={15} aria-hidden="true" />Your knowledge, connected</p><span className={styles.sampleBadge}>Live StudyFlow data</span></div>
      <h1 className="font-display">Learning Constellation<span>.</span></h1>
      <p>Explore how your knowledge connects, where you’re progressing, and what to study next.</p>
    </header>
    {!isHydrated && !providedNodes ? <section className={styles.map} aria-label="Interactive learning map"><div className={styles.stage} data-testid="constellation-stage" data-view="loading"><ConstellationFallback loading /></div></section> : subjects.length === 0 ? <section className={styles.empty}><Sparkles size={36} aria-hidden="true" /><h2>Your constellation is waiting to grow.</h2><p>Add a course and its assignments or tasks to start building your learning map.</p><Link href="/courses">Add a course <ArrowRight size={16} aria-hidden="true" /></Link></section> : <>
      <div className={styles.summary} aria-label="Constellation overview"><span><strong>{subjects.length.toString().padStart(2, "0")}</strong> courses</span><span><strong>{topics.length}</strong> connected topics</span><span><strong>{topics.filter((node) => node.status === "completed").length}</strong> completed</span><span className={styles.summaryNote}>A new perspective on progress</span></div>
      <ConstellationControls filter={filter} onFilter={setFilter} onReset={onReset} staticView={staticView} onToggleView={toggleView} nodes={nodes} />
      <div className={styles.experience}>
        <section className={styles.map} aria-label="Interactive learning map">
          <div className={styles.stage} data-testid="constellation-stage" data-view={staticView ? "2d" : "3d"} data-motion={reducedMotion ? "reduced" : "full"}>
            <div className={styles.mapCaption} aria-hidden="true"><span>01 / KNOWLEDGE ATLAS</span><span>{staticView ? "2D OVERVIEW" : "INTERACTIVE 3D"}</span></div>
            {staticView ? fallback : webglAvailable === null ? <ConstellationFallback loading /> : <SceneErrorBoundary fallback={fallback} onError={onError}>
              <ConstellationScene nodes={nodes} selectedId={selectedId} filter={filter} onSelect={onSelect} resetKey={resetKey} reducedMotion={reducedMotion} compact={compact} interactionEnabled={!compact || touchExploration} onReady={onReady} onError={onError} />
              {!ready && <ConstellationFallback loading />}
            </SceneErrorBoundary>}
            {!staticView && ready && <div className={styles.mapHint}>{selected ? <><span style={{ background: selected.color }} />{selected.kind === "subject" ? "Cluster expanded" : "Connections highlighted"}</> : "Select a course. Follow a connection."}</div>}
          </div>
          <div className={styles.mapFooter}>
            <div className={styles.legend} aria-label="Node status legend"><span><StatusIcon status="completed" />Completed</span><span><StatusIcon status="in-progress" />In progress</span><span><StatusIcon status="needs-review" />Review</span><span><StatusIcon status="not-started" />Not started</span></div>
            {!staticView && (compact ? <button className={styles.touchToggle} type="button" aria-pressed={touchExploration} onClick={() => setTouchExploration((enabled) => !enabled)}><Hand size={16} aria-hidden="true" />{touchExploration ? "Finish exploring" : "Enable touch exploration"}</button> : <p className={styles.gestures}>Drag to orbit · Scroll to zoom</p>)}
            {compact && !staticView && <p className={styles.gestures}>{touchExploration ? "Drag to orbit · Pinch to zoom · Finish to scroll" : "Tap a label to inspect · Scroll to keep exploring"}</p>}
          </div>
        </section>
        <NodeDetailPanel node={selected} nodes={nodes} onSelect={onSelect} />
      </div>
      <section className={styles.browse} aria-label="Browse knowledge">
        <div className={styles.browseHeading}><h2>Find your next connection</h2><p>Every insight is also a tap away.</p></div>
        <div className={styles.subjects} role="group" aria-label="Courses">
          {subjects.map((node) => <button type="button" key={node.id} aria-pressed={subjectId === node.id} onClick={() => onSelect(node.id)}><span className={styles.subjectDot} style={{ background: node.color }} /><span>{node.label}</span><strong>{node.progress}%</strong></button>)}
        </div>
        <div className={styles.topicHeader}><h3>{subjectId && subjectId !== "core" ? `${subjects.find((node) => node.id === subjectId)?.label ?? "Course"} topics` : "All topics"}</h3><span>{visibleTopics.length} {visibleTopics.length === 1 ? "topic" : "topics"}{filter === "all" ? "" : ` · ${statusLabels[filter]}`}</span></div>
        <div className={styles.topics}>
          {visibleTopics.map((node) => <button key={node.id} type="button" aria-pressed={selectedId === node.id} onClick={() => onSelect(node.id)}><span className={styles.topicName}><StatusIcon status={node.status} /><span>{node.label}<small>{statusLabels[node.status]}</small></span></span><strong>{node.progress}%</strong></button>)}
          {visibleTopics.length === 0 && <p className={styles.noMatches}>No topics match this filter in this subject. <button type="button" onClick={() => setFilter("all")}>Show all topics</button></p>}
        </div>
      </section>
      <footer className={styles.pageFooter}><span><Sparkles size={14} aria-hidden="true" />Small steps. Stronger connections.</span><p>Built from your locally stored StudyFlow workspace.</p></footer>
      <p className="sr-only" role="status" aria-live="polite">{selected ? `${selected.label} selected. ${selected.progress}% complete. ${statusLabels[selected.status]}.` : "Showing your learning overview."}</p>
    </>}
  </div>;
}
