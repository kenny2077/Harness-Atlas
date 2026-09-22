import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  Box,
  Braces,
  Cable,
  ChevronDown,
  Database,
  Focus,
  GitBranch,
  Layers3,
  Minus,
  MousePointer2,
  Plus,
  Puzzle,
  ShieldCheck,
  TerminalSquare,
  Workflow,
} from "lucide-react";
import type {
  ArchitectureNode,
  ArchitectureEdge,
  Harness,
  ExplorerState,
  HarnessId,
  ViewId,
} from "../content/types";
import { harnesses } from "../content";
import zcodeIcon from "../assets/brands/zcode.png";
import deepseekIcon from "../assets/brands/deepseek.svg";
import openaiIcon from "../assets/brands/openai.png";
import axIcon from "../assets/brands/ax.svg";

const brandIcons: Record<HarnessId, string> = {
  zcode: zcodeIcon,
  deepseek: deepseekIcon,
  codex: openaiIcon,
  ax: axIcon,
};

const iconMap = {
  client: TerminalSquare,
  core: Layers3,
  model: Braces,
  tool: Workflow,
  policy: ShieldCheck,
  boundary: Box,
  state: Database,
  extension: Puzzle,
};
export const landscapeNodes: ArchitectureNode[] = [
  {
    id: "ax-control",
    label: "AX control plane",
    subtitle: "Declare · reconcile · supervise",
    kind: "core",
    x: 500,
    y: 115,
    width: 310,
    harness: "ax",
    sourceIds: ["a-design"],
    responsibility: {
      text: "AX manages task infrastructure around arbitrary agent processes.",
      sources: ["a-design"],
      evidence: "documented",
    },
    inputs: "Task resources",
    outputs: "Running workloads",
    extension: "Custom runner contracts",
    failureMode:
      "Infrastructure state and agent conversation state are different.",
  },
  ...harnesses
    .filter((h) => h.id !== "ax")
    .flatMap((h, i) => [
      {
        id: h.id,
        label: h.shortName,
        subtitle:
          h.id === "zcode"
            ? "Desktop / Web / TUI"
            : h.id === "deepseek"
              ? "Profiles + bundles"
              : "Clients + protocols",
        kind: "client" as const,
        x: 190 + i * 310,
        y: 370,
        width: 220,
        harness: h.id,
        sourceIds: h.summary.sources,
        responsibility: h.summary,
        inputs: "User or programmatic request",
        outputs: "Agent runtime input",
        extension: "Open this harness lab for its specific interfaces.",
        failureMode:
          "The placement here is conceptual, not a tested AX integration.",
      },
      {
        id: `${h.id}-core`,
        label:
          h.id === "zcode"
            ? "Agent runtime"
            : h.id === "deepseek"
              ? "Cordis plugin tree"
              : "Rust session core",
        subtitle: h.language,
        kind: "core" as const,
        x: 190 + i * 310,
        y: 545,
        width: 220,
        harness: h.id,
        sourceIds: h.summary.sources,
        responsibility: h.summary,
        inputs: "Context and a task",
        outputs: "Tool actions and conversation",
        extension: "Each harness owns its own extension and policy model.",
        failureMode:
          "Similar responsibilities do not mean identical implementations.",
      },
    ]),
];
const landscapeEdges: ArchitectureEdge[] = harnesses
  .filter((h) => h.id !== "ax")
  .map((h) => ({
    id: `${h.id}-flow`,
    from: h.id,
    to: `${h.id}-core`,
    kind: "request",
    label: "shared runtime",
  }));

function pathFor(a: ArchitectureNode, b: ArchitectureNode, result: boolean) {
  if (result)
    return `M ${a.x - (a.width || 190) / 2} ${a.y} H 26 V ${b.y} H ${b.x - (b.width || 190) / 2 - 8}`;
  if (Math.abs(a.y - b.y) < 70) {
    const dir = b.x > a.x ? 1 : -1;
    return `M ${a.x + (dir * (a.width || 190)) / 2} ${a.y} L ${b.x - dir * ((b.width || 190) / 2 + 8)} ${b.y}`;
  }
  const down = b.y > a.y ? 1 : -1;
  const y1 = a.y + down * 43;
  const y2 = b.y - down * 48;
  return `M ${a.x} ${y1} C ${a.x} ${(y1 + y2) / 2}, ${b.x} ${(y1 + y2) / 2}, ${b.x} ${y2}`;
}

export function ArchitectureStage({
  harness,
  state,
  focus,
  onChange,
  onOpenLab,
  onSelect,
}: {
  harness?: Harness;
  state: ExplorerState;
  focus: string[];
  onChange: (patch: Partial<ExplorerState>) => void;
  onOpenLab: (id: ViewId) => void;
  onSelect: (node: ArchitectureNode) => void;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const [choicesOpen, setChoicesOpen] = useState(true);
  const [size, setSize] = useState({ width: 1000, height: 800 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(
    null,
  );
  const rawNodes = harness?.nodes || landscapeNodes;
  const narrow = size.width <= 760;
  const nodes = narrow
    ? rawNodes.map((node, index) => ({
        ...node,
        x:
          !harness && index === 0
            ? 310
            : 155 + ((!harness ? index - 1 : index) % 2) * 310,
        y: !harness
          ? index === 0
            ? 90
            : 270 + Math.floor((index - 1) / 2) * 145
          : 75 + Math.floor(index / 2) * 145,
        width: !harness && index === 0 ? 350 : 250,
      }))
    : rawNodes;
  const edges = harness?.edges || landscapeEdges;
  const isLandscape = !harness;
  const color = harness?.color || "#138A7E";
  const worldWidth = narrow ? 620 : 1000;
  const scale =
    (Math.min(size.width / worldWidth, size.height / 795) * state.zoom) / 100;

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const update = () =>
      setSize({
        width: element.clientWidth || 1000,
        height: element.clientHeight || 800,
      });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    setPan({ x: 0, y: 0 });
  }, [state.harness]);

  function moveFocus(index: number, key: string) {
    let next = index;
    if (key === "ArrowRight" || key === "ArrowDown")
      next = (index + 1) % nodes.length;
    else if (key === "ArrowLeft" || key === "ArrowUp")
      next = (index - 1 + nodes.length) % nodes.length;
    else if (key === "Home") next = 0;
    else if (key === "End") next = nodes.length - 1;
    else return false;
    viewport.current
      ?.querySelectorAll<HTMLButtonElement>(".graph-node")
      [next]?.focus();
    return true;
  }

  return (
    <section
      className={`stage ${narrow ? "narrow-stage" : ""} ${isLandscape ? "landscape-stage" : ""}`}
      aria-label={`${harness?.name || "Landscape"} architecture`}
      style={{ "--accent": color } as CSSProperties}
    >
      <div className="stage-toolbar">
        <div className="stage-toolbar-heading">
          <button
            className="architecture-trigger"
            aria-controls="architecture-choices"
            aria-expanded={choicesOpen}
            aria-label={choicesOpen ? "Collapse architecture choices" : "Expand architecture choices"}
            onClick={() => setChoicesOpen((open) => !open)}
          >
            <Layers3 size={17} />
            Architecture
            <ChevronDown size={16} className={choicesOpen ? "" : "closed"} />
          </button>
          <span className="stage-kind">
            {isLandscape ? "System landscape" : harness.category}
          </span>
        </div>
        {choicesOpen && (
          <div className="architecture-choices" id="architecture-choices" aria-label="Architecture choices">
            <button aria-pressed={isLandscape} onClick={() => onOpenLab("landscape")}>
              <Layers3 size={19} />
              Landscape
            </button>
            {harnesses.map((item) => (
              <button
                key={item.id}
                aria-pressed={state.harness === item.id}
                onClick={() => onOpenLab(item.id)}
              >
                <img src={brandIcons[item.id]} alt="" width="22" height="22" />
                {item.shortName}
              </button>
            ))}
          </div>
        )}
      </div>
      <div
        ref={viewport}
        className="diagram-viewport"
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest("button")) return;
          drag.current = {
            x: event.clientX,
            y: event.clientY,
            px: pan.x,
            py: pan.y,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (drag.current)
            setPan({
              x: drag.current.px + event.clientX - drag.current.x,
              y: drag.current.py + event.clientY - drag.current.y,
            });
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        <div
          className="diagram-world"
          style={{
            width: worldWidth,
            transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          }}
        >
          {isLandscape ? (
            <>
              <div className="landscape-enclosure">
                <span>
                  <Box size={18} />
                  Task environments
                </span>
                <small>Conceptual placement · not a tested integration</small>
              </div>
              <div className="landscape-note">Workload orchestration</div>
              <div className="landscape-base">
                <Cable size={20} />
                <strong>Model ↔ tools</strong>
                <span>Context</span>
                <span>State</span>
                <span>Permissions</span>
              </div>
              <div className="diagram-caption landscape-caption">
                Shared responsibilities. Different implementations.
              </div>
              <svg
                className="graph-lines"
                viewBox={`0 0 ${worldWidth} 795`}
                aria-hidden="true"
              >
                <path
                  d={
                    narrow
                      ? "M310 137 V197"
                      : "M500 158 V240 M190 265 V240 H810 V265"
                  }
                  className="concept-edge"
                />
              </svg>
            </>
          ) : (
            <>
              <div className="diagram-caption client-caption">
                {harness.id === "ax"
                  ? "Declare desired state"
                  : "Different entrypoints, one runtime"}
              </div>
              {harness.id !== "ax" && !narrow && (
                <div
                  className={`execution-enclosure ${harness.id === "zcode" ? "host-enclosure" : ""}`}
                >
                  <span>
                    {harness.id === "zcode"
                      ? "Host authority · no default OS isolation"
                      : "Execution boundary"}
                  </span>
                </div>
              )}
            </>
          )}
          <svg
            className="graph-lines"
            viewBox={`0 0 ${worldWidth} 795`}
            aria-hidden="true"
          >
            <defs>
              <marker
                id="arrow"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="4"
                orient="auto"
              >
                <path
                  d="M0 1 L6 4 L0 7"
                  fill="none"
                  stroke="context-stroke"
                  strokeWidth="1.4"
                />
              </marker>
            </defs>
            {edges.map((e) => {
              const a = nodes.find((n) => n.id === e.from)!;
              const b = nodes.find((n) => n.id === e.to)!;
              const active = state.node
                ? e.from === state.node || e.to === state.node
                : focus.includes(e.from) && focus.includes(e.to);
              return (
                <g
                  key={e.id}
                  className={`${active ? "active-edge" : ""} ${e.kind}-edge`}
                >
                  <path
                    d={
                      e.kind === "composition" && !isLandscape && !narrow
                        ? `M ${a.x - (a.width || 190) / 2} ${a.y} H 52 V ${b.y} H ${b.x - (b.width || 190) / 2 - 8}`
                        : pathFor(a, b, e.kind === "result")
                    }
                    markerEnd="url(#arrow)"
                  />
                  {e.label &&
                    e.kind !== "result" &&
                    e.kind !== "composition" &&
                    !narrow && (
                      <text
                        x={
                          (a.x + b.x) / 2 + (Math.abs(a.x - b.x) < 30 ? 17 : 0)
                        }
                        y={(a.y + b.y) / 2 - 12}
                      >
                        {e.label}
                      </text>
                    )}
                  {e.kind === "result" && !narrow && (
                    <text x="26" y={(a.y + b.y) / 2 - 30}>
                      result
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          {nodes.map((n, i) => {
            const Icon = iconMap[n.kind];
            const active = state.node === n.id;
            const focused = focus.includes(n.id);
            const tone = n.harness
              ? harnesses.find((h) => h.id === n.harness)!.color
              : n.kind === "policy"
                ? "#AD571F"
                : n.kind === "model"
                  ? "#6D5BD0"
                  : color;
            return (
              <button
                key={`${state.harness}-${n.id}`}
                className={`graph-node node-${n.kind} ${active ? "selected" : ""} ${focused ? "chapter-focus" : ""}`}
                style={
                  {
                    left: n.x,
                    top: n.y,
                    width: n.width || 190,
                    "--node-color": tone,
                  } as CSSProperties
                }
                aria-label={`Inspect ${n.label}`}
                aria-pressed={active}
                onClick={() => onSelect(n)}
                onKeyDown={(event) => {
                  if (moveFocus(i, event.key)) event.preventDefault();
                }}
              >
                {n.harness && (n.id === n.harness || n.id === "ax-control") ? (
                  <img src={brandIcons[n.harness]} alt="" width="27" height="27" />
                ) : (
                  <Icon size={27} strokeWidth={1.7} aria-hidden="true" />
                )}
                <span>
                  <strong>{n.label}</strong>
                  <small>{n.subtitle}</small>
                  <small className="text-flow-connections">
                    {edges
                      .filter((edge) => edge.from === n.id)
                      .map(
                        (edge) =>
                          `To ${nodes.find((target) => target.id === edge.to)?.label}`,
                      )
                      .join(" · ")}
                  </small>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="stage-bottom">
        <span className="diagram-hint">
          <MousePointer2 size={15} />
          Select a component to inspect
        </span>
        <div className="zoom-controls" aria-label="Diagram controls">
          <button
            aria-label="Zoom out"
            disabled={state.zoom <= 60}
            onClick={() => onChange({ zoom: Math.max(60, state.zoom - 20) })}
          >
            <Minus size={17} />
          </button>
          <output aria-label="Zoom level">{state.zoom}%</output>
          <button
            aria-label="Zoom in"
            disabled={state.zoom >= 150}
            onClick={() => onChange({ zoom: Math.min(150, state.zoom + 20) })}
          >
            <Plus size={17} />
          </button>
          <button
            aria-label="Reset diagram view"
            onClick={() => {
              setPan({ x: 0, y: 0 });
              onChange({ zoom: 100 });
            }}
          >
            <Focus size={18} />
          </button>
        </div>
      </div>
      <details className="mobile-component-list">
        <summary>
          <GitBranch size={16} />
          All components
        </summary>
        <div>
          {nodes.map((n) => (
            <button key={n.id} onClick={() => onSelect(n)}>
              {n.label}
            </button>
          ))}
        </div>
      </details>
    </section>
  );
}
