import zcode from "./zcode.json";
import deepseek from "./deepseek.json";
import codex from "./codex.json";
import ax from "./ax.json";
import sourceData from "./sources.json";
import timelineData from "./timeline.json";
import comparisonData from "./comparison.json";
import type {
  Harness,
  SourceRef,
  TimelineEvent,
  ComparisonDimension,
} from "./types";

export const harnesses = [zcode, deepseek, codex, ax] as Harness[];
export const sources = sourceData as SourceRef[];
export const timeline = timelineData as TimelineEvent[];
export const comparisons = comparisonData as ComparisonDimension[];
export const snapshotDate = "2026-09-21";
export function getHarness(id: string) {
  return harnesses.find((h) => h.id === id);
}
export function sourceUrl(source: SourceRef) {
  const base = `https://github.com/${source.repository}`;
  if (source.kind === "commit") return `${base}/commit/${source.commit}`;
  if (source.kind === "release")
    return `${base}/releases/tag/${source.releaseTag}`;
  return `${base}/blob/${source.commit}/${source.path}${source.lineAnchor ? `#${source.lineAnchor}` : ""}`;
}
export const glossary = [
  [
    "Harness",
    "The software around a model that manages context, tools, execution and the continuing task.",
  ],
  [
    "Turn",
    "A response to user input that can contain several model requests and tool calls.",
  ],
  [
    "MCP",
    "Model Context Protocol: a common protocol for connecting applications to external tools and resources.",
  ],
  [
    "Skill",
    "Reusable instructions and supporting resources that guide an agent through a kind of work.",
  ],
  [
    "Hook",
    "A handler invoked at a lifecycle event to inspect, augment or influence behavior.",
  ],
  [
    "Approval",
    "A policy or human decision permitting an action. It does not itself isolate a process.",
  ],
  [
    "Sandbox",
    "An execution environment that constrains access to resources such as files, processes and the network.",
  ],
  [
    "Reconciliation",
    "Repeatedly bringing observed infrastructure state into agreement with a desired specification.",
  ],
  [
    "Projection",
    "A view derived from stored facts, such as model context assembled from a session event log.",
  ],
  [
    "Compaction",
    "Reducing conversation context so continued work fits the model’s input budget.",
  ],
];
