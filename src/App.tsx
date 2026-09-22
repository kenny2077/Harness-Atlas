import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronRight,
  GitBranch,
  Layers3,
} from "lucide-react";
import { harnesses, getHarness, snapshotDate } from "./content";
import { parseHash, serializeState, defaults } from "./state";
import type { ArchitectureNode, ExplorerState, ViewId } from "./content/types";
import {
  ArchitectureStage,
  landscapeNodes,
} from "./components/ArchitectureStage";
import { Inspector } from "./components/Inspector";
import { SourceLinks } from "./components/SourceLinks";
import {
  ComparePage,
  EvolutionPage,
  SourcesPage,
} from "./components/ReferencePages";

export default function App() {
  const [state, setState] = useState(() => parseHash(window.location.hash));
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
      className={`app ${largeText ? "large-text" : ""}`}
      style={{ "--accent": color } as CSSProperties}
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
          href="https://github.com/kenny2077/agent-harness-atlas"
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
            <div className="harness-bar">
              <a
                className={state.harness === "landscape" ? "current" : ""}
                href="#/learn/landscape"
              >
                <Layers3 size={16} />
                Landscape
              </a>
              <span className="bar-divider" />
              {harnesses.map((h) => (
                <button
                  key={h.id}
                  aria-pressed={state.harness === h.id}
                  onClick={() => openLab(h.id)}
                  style={{ "--project": h.color } as CSSProperties}
                >
                  <span className="project-mark" />
                  {h.shortName}
                  <small>{h.id === "ax" ? "Orchestrator" : ""}</small>
                </button>
              ))}
            </div>
            <div className="lab-layout">
              <aside className="lesson-pane">
                <div className="lesson-top">
                  <div className="breadcrumb">
                    <BookOpen size={15} />
                    Learn
                    <ChevronRight size={13} />
                    <span>{harness?.shortName || "Landscape"}</span>
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
                  <p className="lesson-intro">
                    {harness
                      ? chapter!.body
                      : "Three harnesses run the coding loop. AX runs the workloads around them."}
                  </p>
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
                <div className="lesson-detail" aria-live="polite">
                  <h2>
                    {harness ? "The idea to take away" : "Built from source"}
                  </h2>
                  <p>
                    {harness
                      ? chapter!.takeaway
                      : "Every lab connects the explanation to a pinned revision. Architectural fit is an inference; this is not a performance ranking."}
                  </p>
                  <SourceLinks
                    ids={chapter?.sourceIds || ["a-design"]}
                    compact
                  />
                  {harness?.id === "ax" && (
                    <p className="small-note">
                      Current architecture: v0.3. Earlier built-in harness
                      features are historical.
                    </p>
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
                <ArchitectureStage
                  harness={harness}
                  state={state}
                  focus={chapter?.focus || []}
                  onChange={change}
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
            {harness && (
              <section
                className="harness-notes"
                aria-label={`${harness.name} trade-offs`}
              >
                <div>
                  <h2>Where {harness.shortName} fits</h2>
                  <p className="small-note">
                    Architectural judgments, not benchmark results.
                  </p>
                  {harness.taskFit.map((f) => (
                    <div key={f.text}>
                      <p>{f.text}</p>
                      <SourceLinks ids={f.sources} compact />
                    </div>
                  ))}
                </div>
                <div>
                  <h2>Design advantages</h2>
                  {harness.advantages.map((f) => (
                    <div key={f.text}>
                      <p>{f.text}</p>
                      <SourceLinks ids={f.sources} compact />
                    </div>
                  ))}
                </div>
                <div>
                  <h2>Costs and constraints</h2>
                  {harness.tradeoffs.map((f) => (
                    <div key={f.text}>
                      <p>{f.text}</p>
                      <SourceLinks ids={f.sources} compact />
                    </div>
                  ))}
                  <p>{harness.maturity.text}</p>
                  <SourceLinks ids={harness.maturity.sources} compact />
                </div>
              </section>
            )}
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
