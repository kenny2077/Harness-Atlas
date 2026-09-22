import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronRight,
  GitBranch,
  Layers3,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { getHarness, snapshotDate } from "./content";
import { parseHash, serializeState, defaults } from "./state";
import type { ArchitectureNode, ExplorerState, ViewId } from "./content/types";
import {
  ArchitectureStage,
  landscapeNodes,
} from "./components/ArchitectureStage";
import { Inspector } from "./components/Inspector";
import {
  ComparePage,
  EvolutionPage,
  SourcesPage,
} from "./components/ReferencePages";

export default function App() {
  const [state, setState] = useState(() => parseHash(window.location.hash));
  const [panelOpen, setPanelOpen] = useState(true);
  const [panelWidth, setPanelWidth] = useState<number>();
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [resizingPanel, setResizingPanel] = useState(false);
  const panelDrag = useRef<{ x: number; width: number } | null>(null);
  const maxPanelWidth = Math.min(600, viewportWidth * 0.55);
  const defaultPanelWidth = viewportWidth <= 1100 ? 310 : Math.max(320, viewportWidth * 0.29);
  const visiblePanelWidth = Math.min(maxPanelWidth, Math.max(300, panelWidth ?? defaultPanelWidth));
  useEffect(() => {
    const resize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);
  const panelToggle = useRef<HTMLButtonElement>(null);
  const restoreToggleFocus = useRef(false);
  function togglePanel() {
    restoreToggleFocus.current = true;
    setPanelOpen((open) => !open);
  }
  useEffect(() => {
    if (restoreToggleFocus.current) {
      panelToggle.current?.focus();
      restoreToggleFocus.current = false;
    }
  }, [panelOpen]);
  const fontProbe = useRef<HTMLSpanElement>(null);
  const [largeText, setLargeText] = useState(false);
  useEffect(() => {
    const element = fontProbe.current;
    if (!element) return;
    const update = () =>
      setLargeText(element.getBoundingClientRect().width > 20);
    const observer = new ResizeObserver(update);
    observer.observe(element);
    update();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const listener = () => setState(parseHash(window.location.hash));
    window.addEventListener("hashchange", listener);
    return () => window.removeEventListener("hashchange", listener);
  }, []);
  function change(patch: Partial<ExplorerState>) {
    const next = { ...state, ...patch };
    window.location.hash = serializeState(next);
    setState(next);
  }
  function openLab(id: ViewId) {
    change({ ...defaults, harness: id });
  }
  const harness = getHarness(state.harness);
  const index = Math.max(
    0,
    harness?.chapters.findIndex((c) => c.id === state.chapter) ?? 0,
  );
  const chapter = harness?.chapters[index];
  const selected = (harness?.nodes || landscapeNodes).find(
    (n) => n.id === state.node,
  );
  const color = harness?.color || "#2F62D6";
  useEffect(() => {
    document.title = `${harness?.name || (state.page === "learn" ? "Landscape" : state.page[0].toUpperCase() + state.page.slice(1))} · Agent Harness Atlas`;
  }, [state.page, harness]);

  return (
    <div
      className={`app ${largeText ? "large-text" : ""} ${resizingPanel ? "resizing-panel" : ""}`}
      style={{ "--accent": color, "--panel-width": `${visiblePanelWidth}px` } as CSSProperties}
    >
      <span ref={fontProbe} className="font-probe" aria-hidden="true" />
      <a
        href="#main"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        Skip to content
      </a>
      <header className="site-header">
        <a className="brand" href="#/learn/landscape">
          <Layers3 size={29} strokeWidth={1.7} />
          <span>Agent Harness Atlas</span>
        </a>
        <nav aria-label="Main navigation">
          {(["learn", "compare", "evolution", "sources"] as const).map(
            (page, i) => (
              <a
                key={page}
                href={`#/${page}${page === "learn" ? "/landscape" : ""}`}
                aria-current={state.page === page ? "page" : undefined}
              >
                {["Learn", "Compare", "Evolve", "Sources"][i]}
              </a>
            ),
          )}
        </nav>
        <span className="snapshot">Snapshot {snapshotDate}</span>
        <a
          className="repo-link"
          href="https://github.com/kenny2077/Harness-Atlas"
          target="_blank"
          rel="noreferrer"
          aria-label="Open the Atlas source repository"
        >
          <GitBranch size={19} />
        </a>
      </header>
      <main id="main" tabIndex={-1}>
        {state.page === "learn" ? (
          <>
            <div className={`lab-layout${panelOpen ? "" : " is-collapsed"}`}>
              {panelOpen && (
                <div
                  className="panel-divider"
                  role="separator"
                  tabIndex={0}
                  aria-label="Resize learning panel"
                  aria-orientation="vertical"
                  aria-controls="learning-panel"
                  aria-valuemin={0}
                  aria-valuemax={Math.round(maxPanelWidth)}
                  aria-valuenow={Math.round(visiblePanelWidth)}
                  aria-valuetext={`${Math.round(visiblePanelWidth)} pixels wide`}
                  title="Drag to resize; drag left to collapse"
                  onPointerDown={(event) => {
                    if (event.button !== 0) return;
                    event.preventDefault();
                    event.currentTarget.focus();
                    panelDrag.current = { x: event.clientX, width: visiblePanelWidth };
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setResizingPanel(true);
                  }}
                  onPointerMove={(event) => {
                    const drag = panelDrag.current;
                    if (!drag) return;
                    const width = drag.width + event.clientX - drag.x;
                    if (width < 200) {
                      setPanelWidth(drag.width);
                      panelDrag.current = null;
                      setResizingPanel(false);
                      togglePanel();
                    } else {
                      setPanelWidth(Math.min(maxPanelWidth, Math.max(300, width)));
                    }
                  }}
                  onPointerUp={() => {
                    panelDrag.current = null;
                    setResizingPanel(false);
                  }}
                  onPointerCancel={() => {
                    if (panelDrag.current) setPanelWidth(panelDrag.current.width);
                    panelDrag.current = null;
                    setResizingPanel(false);
                  }}
                  onLostPointerCapture={() => {
                    panelDrag.current = null;
                    setResizingPanel(false);
                  }}
                  onKeyDown={(event) => {
                    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
                    event.preventDefault();
                    if (event.key === "Home" || (event.key === "ArrowLeft" && visiblePanelWidth <= 300)) {
                      togglePanel();
                    } else {
                      const width = event.key === "End" ? maxPanelWidth : visiblePanelWidth + (event.key === "ArrowRight" ? 24 : -24);
                      setPanelWidth(Math.min(maxPanelWidth, Math.max(300, width)));
                    }
                  }}
                />
              )}
              <aside className="lesson-pane" id="learning-panel" hidden={!panelOpen}>
                <div className="lesson-top">
                  <div className="breadcrumb">
                    <BookOpen size={15} />
                    Learn
                    <ChevronRight size={13} />
                    <span>{harness?.shortName || "Landscape"}</span>
                    {panelOpen && (
                      <button
                        ref={panelToggle}
                        className="lesson-toggle"
                        aria-controls="learning-panel"
                        aria-expanded={true}
                        aria-label="Collapse learning panel"
                        title="Collapse learning panel"
                        onClick={togglePanel}
                      >
                        <PanelLeftClose size={20} />
                      </button>
                    )}
                  </div>
                  <h1>
                    {harness ? (
                      chapter!.heading
                    ) : (
                      <>
                        Four systems.
                        <br />
                        Two layers.
                      </>
                    )}
                  </h1>
                  {harness ? (
                    <ol className="chapter-list">
                      {harness.chapters.map((c, i) => (
                        <li key={c.id}>
                          <button
                            aria-current={index === i ? "step" : undefined}
                            onClick={() => change({ chapter: c.id, node: "" })}
                          >
                            <span className="chapter-number">{i + 1}</span>
                            <span>{c.title}</span>
                            {index === i && <ChevronRight size={16} />}
                          </button>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <ol className="landscape-steps">
                      <li>
                        <span className="chapter-number">1</span>
                        <div>
                          <h2>See the landscape</h2>
                          <p>Understand which layer each system owns.</p>
                        </div>
                      </li>
                      <li>
                        <span className="chapter-number">2</span>
                        <div>
                          <h2>Follow a request</h2>
                          <p>
                            Step through a real architecture, from input to
                            execution.
                          </p>
                        </div>
                      </li>
                      <li>
                        <span className="chapter-number">3</span>
                        <div>
                          <h2>Inspect the source</h2>
                          <p>Open a component to see its contracts and code.</p>
                        </div>
                      </li>
                    </ol>
                  )}
                </div>
                <div className="lesson-controls">
                  {harness ? (
                    <>
                      <button
                        className="secondary-button"
                        disabled={index === 0}
                        onClick={() =>
                          change({
                            chapter: harness.chapters[index - 1].id,
                            node: "",
                          })
                        }
                      >
                        <ArrowLeft size={16} />
                        Previous
                      </button>
                      <span className="step-count">
                        {index + 1} / {harness.chapters.length}
                      </span>
                      <button
                        className="primary-button"
                        onClick={() =>
                          index < harness.chapters.length - 1
                            ? change({
                                chapter: harness.chapters[index + 1].id,
                                node: "",
                              })
                            : change({ page: "compare", node: "", chapter: "" })
                        }
                      >
                        {index < harness.chapters.length - 1
                          ? "Next step"
                          : "Compare"}
                        <ArrowRight size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      className="primary-button wide"
                      onClick={() => openLab("codex")}
                    >
                      Explore a coding turn
                      <ArrowRight size={17} />
                    </button>
                  )}
                </div>
              </aside>
              <div className="stage-wrap">
                {!panelOpen && (
                  <button
                    ref={panelToggle}
                    className="lesson-toggle lesson-reopen"
                    aria-controls="learning-panel"
                    aria-expanded={false}
                    aria-label="Expand learning panel"
                    title="Expand learning panel"
                    onClick={togglePanel}
                  >
                    <PanelLeftOpen size={20} />
                  </button>
                )}
                <ArchitectureStage
                  harness={harness}
                  state={state}
                  focus={chapter?.focus || []}
                  onChange={change}
                  onOpenLab={openLab}
                  onSelect={(node) => change({ node: node.id })}
                />
                {selected && (
                  <Inspector
                    key={selected.id}
                    node={selected}
                    onClose={() => change({ node: "" })}
                    onOpenLab={
                      !harness
                        ? () => openLab(selected.harness || "ax")
                        : undefined
                    }
                  />
                )}
              </div>
            </div>
          </>
        ) : state.page === "compare" ? (
          <ComparePage state={state} onChange={change} />
        ) : state.page === "evolution" ? (
          <EvolutionPage state={state} onChange={change} />
        ) : (
          <SourcesPage state={state} onChange={change} />
        )}
      </main>
      <footer className="site-footer">
        <span>Agent Harness Atlas</span>
        <span>Source snapshot · {snapshotDate}</span>
        <a href="#/sources">Evidence & methodology</a>
      </footer>
    </div>
  );
}
