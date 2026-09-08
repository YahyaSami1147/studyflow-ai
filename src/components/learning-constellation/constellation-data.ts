import type {
  ConstellationFilter,
  KnowledgeNodeData,
  NodeStatus,
  Position3D,
} from "./types";

export const statusLabels: Record<NodeStatus, string> = {
  completed: "Completed",
  "in-progress": "In progress",
  "needs-review": "Needs review",
  "not-started": "Not started",
};

type TopicSeed = Omit<
  KnowledgeNodeData,
  "kind" | "subject" | "parentId" | "importance" | "color"
>;

interface SubjectSeed {
  id: string;
  label: string;
  shortLabel?: string;
  color: string;
  position: Position3D;
  description: string;
  nextStep: string;
  topics: TopicSeed[];
}

// Development fixture only. Production uses buildConstellationFromStudyData from the
// adapter; this graph remains for relationship/rendering tests and visual development.
const subjects: SubjectSeed[] = [
  {
    id: "mathematics",
    label: "Mathematics",
    color: "#67e8f9",
    position: [-3.05, 1.65, 0.25],
    description: "The language behind patterns, uncertainty, and change. Your foundations are strong; a little retrieval practice will reconnect the harder ideas.",
    nextStep: "Review Probability, then try a short Statistics practice set.",
    topics: [
      {
        id: "algebra",
        label: "Algebra",
        progress: 100,
        mastery: 94,
        status: "completed",
        position: [-4.45, 2.65, 0.45],
        description: "Work fluently with equations, functions, and symbolic relationships. These foundations support calculus and computational thinking.",
        nextStep: "Keep your foundations fresh with five mixed equation problems.",
        relatedIds: ["calculus", "algorithms"],
      },
      {
        id: "calculus",
        label: "Calculus",
        progress: 76,
        mastery: 85,
        status: "in-progress",
        position: [-2.65, 3.15, -0.45],
        description: "Connect derivatives and integrals to rates of change, accumulated quantities, and optimization.",
        nextStep: "Practice the chain rule before tackling gradient-based optimization.",
        relatedIds: ["algebra", "mechanics", "neural-networks"],
      },
      {
        id: "statistics",
        label: "Statistics",
        progress: 64,
        mastery: 68,
        status: "needs-review",
        position: [-4.7, 1.05, -0.3],
        description: "Turn observations into evidence using distributions, sampling, and confidence intervals.",
        nextStep: "Review Probability before interpreting a new confidence interval.",
        relatedIds: ["probability", "research-writing"],
      },
      {
        id: "probability",
        label: "Probability",
        progress: 48,
        mastery: 65,
        status: "needs-review",
        position: [-2.7, 0.35, 0.95],
        description: "Reason about uncertainty with conditional probability, independence, and Bayes' theorem.",
        nextStep: "Create a five-question quiz on conditional probability in StudyFlow AI.",
        relatedIds: ["statistics", "neural-networks"],
      },
    ],
  },
  {
    id: "computer-science",
    label: "Computer Science",
    shortLabel: "Computer science",
    color: "#a78bfa",
    position: [2.35, 1.85, -0.35],
    description: "Build a connected understanding of how software stores information, solves problems, and delivers useful experiences.",
    nextStep: "Compare two search algorithms, then explain their time complexity.",
    topics: [
      {
        id: "data-structures",
        label: "Data Structures",
        progress: 100,
        mastery: 92,
        status: "completed",
        position: [1.15, 3.05, 0.2],
        description: "Choose between arrays, linked lists, trees, and graphs based on the operations a problem needs.",
        nextStep: "Explain when a hash table is a better fit than a sorted array.",
        relatedIds: ["algorithms", "databases"],
      },
      {
        id: "algorithms",
        label: "Algorithms",
        progress: 72,
        mastery: 74,
        status: "in-progress",
        position: [3.25, 3.35, -0.65],
        description: "Design correct, efficient solutions with search, sorting, recursion, and complexity analysis.",
        nextStep: "Trace binary search by hand and compare its cost with linear search.",
        relatedIds: ["data-structures", "algebra"],
      },
      {
        id: "web-development",
        label: "Web Development",
        progress: 84,
        mastery: 82,
        status: "in-progress",
        position: [4.1, 2.05, 0.4],
        description: "Connect interface design, accessible interactions, and application data to build useful web products.",
        nextStep: "Audit one of your forms using only the keyboard.",
        relatedIds: ["databases", "technical-writing"],
      },
      {
        id: "databases",
        label: "Databases",
        progress: 32,
        mastery: 46,
        status: "in-progress",
        position: [2.85, 0.6, 0.85],
        description: "Model relationships, write queries, and protect data integrity with keys and constraints.",
        nextStep: "Sketch a course-and-assignment schema and write your first JOIN.",
        relatedIds: ["data-structures", "web-development"],
      },
    ],
  },
  {
    id: "physics",
    label: "Physics",
    color: "#fbbf24",
    position: [3.15, -1.65, 0.2],
    description: "Use mathematical models to connect motion, energy, and the behavior of the physical world.",
    nextStep: "Revisit energy conservation before your next Thermodynamics session.",
    topics: [
      {
        id: "mechanics",
        label: "Mechanics",
        progress: 100,
        mastery: 90,
        status: "completed",
        position: [4.7, -0.65, -0.15],
        description: "Explain motion with forces, momentum, and conservation of energy.",
        nextStep: "Solve a motion problem using both Newton's laws and energy methods.",
        relatedIds: ["calculus", "thermodynamics"],
      },
      {
        id: "thermodynamics",
        label: "Thermodynamics",
        progress: 56,
        mastery: 54,
        status: "needs-review",
        position: [4.8, -2.2, 0.65],
        description: "Follow heat, work, and energy through systems while building intuition for entropy.",
        nextStep: "Review the first law and label heat and work in three examples.",
        relatedIds: ["mechanics"],
      },
      {
        id: "waves-optics",
        label: "Waves & Optics",
        shortLabel: "Waves & optics",
        progress: 36,
        mastery: 48,
        status: "in-progress",
        position: [3.45, -3.15, -0.55],
        description: "Explore oscillation, interference, and the way light travels and forms images.",
        nextStep: "Draw the difference between constructive and destructive interference.",
        relatedIds: ["electromagnetism", "computer-vision"],
      },
      {
        id: "electromagnetism",
        label: "Electromagnetism",
        progress: 0,
        mastery: 0,
        status: "not-started",
        position: [1.95, -1.45, -0.65],
        description: "Discover how electric charges, fields, and currents explain circuits and electromagnetic waves.",
        nextStep: "Start with charge and Coulomb's law, then sketch a simple electric field.",
        relatedIds: ["waves-optics"],
      },
    ],
  },
  {
    id: "writing",
    label: "Writing",
    color: "#34d399",
    position: [-3.4, -1.55, -0.45],
    description: "Make ideas easier to follow through clear structure, thoughtful evidence, and precise language.",
    nextStep: "Apply your argument outline to one paragraph of research writing.",
    topics: [
      {
        id: "argumentation",
        label: "Argumentation",
        progress: 100,
        mastery: 93,
        status: "completed",
        position: [-4.75, -0.65, -0.1],
        description: "Build an argument with a clear claim, relevant evidence, and reasoning that connects them.",
        nextStep: "Strengthen an existing paragraph by addressing one counterargument.",
        relatedIds: ["research-writing", "critical-reading"],
      },
      {
        id: "research-writing",
        label: "Research Writing",
        progress: 68,
        mastery: 73,
        status: "in-progress",
        position: [-5, -2.3, 0.4],
        description: "Synthesize credible sources, distinguish evidence from opinion, and cite ideas accurately.",
        nextStep: "Compare two sources and write a short synthesis in your StudyFlow notes.",
        relatedIds: ["argumentation", "statistics"],
      },
      {
        id: "technical-writing",
        label: "Technical Writing",
        progress: 52,
        mastery: 67,
        status: "in-progress",
        position: [-3.75, -3.15, -0.85],
        description: "Explain a process or system with a clear audience, useful examples, and an easy-to-follow structure.",
        nextStep: "Write a concise setup guide for a project you know well.",
        relatedIds: ["web-development", "prompt-engineering"],
      },
      {
        id: "critical-reading",
        label: "Critical Reading",
        progress: 100,
        mastery: 91,
        status: "completed",
        position: [-2.1, -1.9, 0.3],
        description: "Identify assumptions, evaluate sources, and notice how an author's evidence supports their conclusions.",
        nextStep: "Annotate the claims and evidence in a new article.",
        relatedIds: ["argumentation", "research-writing"],
      },
    ],
  },
  {
    id: "ai-machine-learning",
    label: "AI & Machine Learning",
    shortLabel: "AI & ML",
    color: "#f9a8d4",
    position: [-0.1, -2.65, 0.65],
    description: "Connect mathematics, code, and communication to understand how intelligent systems learn and how to work with them.",
    nextStep: "Review Probability, then trace a small neural network's prediction.",
    topics: [
      {
        id: "neural-networks",
        label: "Neural Networks",
        progress: 44,
        mastery: 52,
        status: "in-progress",
        position: [-1.2, -3.8, 0.15],
        description: "Understand layers, activations, loss functions, and how gradients improve a model's predictions.",
        nextStep: "Trace a forward pass through a network with two inputs and one output.",
        relatedIds: ["calculus", "probability", "computer-vision"],
      },
      {
        id: "prompt-engineering",
        label: "Prompt Engineering",
        progress: 100,
        mastery: 88,
        status: "completed",
        position: [-0.85, -1.35, 1.15],
        description: "Give AI systems clear goals, useful context, and examples, then evaluate the output against explicit criteria.",
        nextStep: "Compare two study-quiz prompts and check their questions for accuracy.",
        relatedIds: ["technical-writing", "nlp"],
      },
      {
        id: "computer-vision",
        label: "Computer Vision",
        progress: 0,
        mastery: 0,
        status: "not-started",
        position: [1.3, -3.65, -0.2],
        description: "Explore how models turn pixels into useful representations for image classification and recognition.",
        nextStep: "Start with image arrays and inspect how a simple convolution changes an image.",
        relatedIds: ["neural-networks", "waves-optics"],
      },
      {
        id: "nlp",
        label: "Natural Language Processing",
        shortLabel: "NLP",
        progress: 24,
        mastery: 35,
        status: "in-progress",
        position: [1.25, -2.5, 1.25],
        description: "Study tokens, embeddings, and language models to understand how computers represent and generate text.",
        nextStep: "Tokenize a short paragraph and compare how words and subwords are represented.",
        relatedIds: ["prompt-engineering", "neural-networks"],
      },
    ],
  },
];

function average(nodes: Pick<KnowledgeNodeData, "progress" | "mastery">[], field: "progress" | "mastery") {
  const values = nodes.map((node) => node[field]).filter((value): value is number => value !== null);
  return values.length === 0 ? 0 : Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

const subjectNodes: KnowledgeNodeData[] = subjects.map((subject) => ({
  id: subject.id,
  label: subject.label,
  shortLabel: subject.shortLabel,
  kind: "subject",
  subject: subject.label,
  parentId: "core",
  progress: average(subject.topics, "progress"),
  mastery: average(subject.topics, "mastery"),
  status: "in-progress",
  position: subject.position,
  importance: 1,
  color: subject.color,
  description: subject.description,
  nextStep: subject.nextStep,
  relatedIds: subject.topics.map((topic) => topic.id),
}));

const topicNodes: KnowledgeNodeData[] = subjects.flatMap((subject) =>
  subject.topics.map((topic) => ({
    ...topic,
    kind: "topic" as const,
    subject: subject.label,
    parentId: subject.id,
    importance: 0.45,
    color: subject.color,
  })),
);

export const constellationNodes: KnowledgeNodeData[] = [
  {
    id: "core",
    label: "StudyFlow",
    kind: "core",
    subject: "Your learning",
    parentId: null,
    progress: average(topicNodes, "progress"),
    mastery: average(topicNodes, "mastery"),
    status: "in-progress",
    position: [0, 0, 0],
    importance: 1.4,
    color: "#38bdf8",
    description: "A connected view of five courses and the ideas that bring them together. Explore a course to find your next useful step.",
    nextStep: "Start with a topic that needs review, or follow a connection into something new.",
    relatedIds: subjectNodes.map((subject) => subject.id),
  },
  ...subjectNodes,
  ...topicNodes,
];

export function getSubjectId(node: KnowledgeNodeData): string {
  return node.kind === "topic" ? node.parentId ?? node.id : node.id;
}

export function matchesFilter(node: KnowledgeNodeData, filter: ConstellationFilter): boolean {
  return filter === "all" || node.status === filter;
}

/** Parent/child and conceptual relationships are undirected for exploration. */
export function getRelatedNodes(node: KnowledgeNodeData, nodes: KnowledgeNodeData[]): KnowledgeNodeData[] {
  return nodes.filter((candidate) =>
    candidate.id !== node.id && (
      candidate.id === node.parentId ||
      candidate.parentId === node.id ||
      node.relatedIds.includes(candidate.id) ||
      candidate.relatedIds.includes(node.id)
    ),
  );
}
