export type HarnessId = "zcode" | "deepseek" | "codex" | "ax";
export type EvidenceLevel =
  | "implemented"
  | "documented"
  | "historical"
  | "inferred";
export type ViewId = HarnessId | "landscape";

export interface SourceRef {
  id: string;
  title: string;
  harness: HarnessId;
  repository: string;
  commit: string;
  path: string;
  lineAnchor?: string;
  evidence: EvidenceLevel;
  kind?: "file" | "commit" | "release";
  releaseTag?: string;
}

export interface CitedText {
  text: string;
  sources: string[];
  evidence: EvidenceLevel;
}

export interface ArchitectureNode {
  id: string;
  label: string;
  subtitle: string;
  kind:
    | "client"
    | "core"
    | "model"
    | "tool"
    | "policy"
    | "boundary"
    | "state"
    | "extension";
  x: number;
  y: number;
  width?: number;
  harness?: HarnessId;
  responsibility: CitedText;
  inputs: string;
  outputs: string;
  extension: string;
  failureMode: string;
  sourceIds: string[];
  code?: { text: string; annotation: string; source: string };
}

export interface ArchitectureEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  kind: "request" | "result" | "state" | "composition";
}

export interface Chapter {
  id: string;
  title: string;
  heading: string;
  body: string;
  focus: string[];
  takeaway: string;
  sourceIds: string[];
}

export interface Harness {
  id: HarnessId;
  name: string;
  shortName: string;
  color: string;
  language: string;
  category: "Coding harness" | "Workload orchestrator";
  summary: CitedText;
  maturity: CitedText;
  advantages: CitedText[];
  tradeoffs: CitedText[];
  taskFit: CitedText[];
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  chapters: Chapter[];
}

export interface TimelineEvent {
  id: string;
  date: string;
  harness: HarnessId;
  title: string;
  description: string;
  scope: "implementation" | "release" | "history-boundary" | "removal";
  auditability: "exact" | "present-by" | "history-boundary";
  sourceIds: string[];
}

export interface ComparisonDimension {
  id: string;
  title: string;
  group: "Architecture" | "Extensions" | "Safety" | "Operations";
  description: string;
  findings: Record<HarnessId, CitedText>;
}

export interface ExplorerState {
  page: "learn" | "compare" | "evolution" | "sources";
  harness: ViewId;
  chapter: string;
  node: string;
  overlay: "architecture" | "safety";
  zoom: number;
  filter: string;
}
