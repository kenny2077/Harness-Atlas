import { useState } from "react";
import {
  ArrowUpRight,
  Search,
  GitCommitHorizontal,
  GitBranch,
  Info,
} from "lucide-react";
import {
  comparisons,
  glossary,
  harnesses,
  sources,
  sourceUrl,
  timeline,
} from "../content";
import type { ExplorerState } from "../content/types";
import { SourceLinks } from "./SourceLinks";

type Props = {
  state: ExplorerState;
  onChange: (patch: Partial<ExplorerState>) => void;
};

export function ComparePage({ state, onChange }: Props) {
  const groups = ["All", "Architecture", "Extensions", "Safety", "Operations"];
  const selected = groups.includes(state.filter) ? state.filter : "All";
  return (
    <div className="reference-page compare-page">
      <div className="page-heading">
        <h1>
          Same questions.
          <br />
          Different boundaries.
        </h1>
        <p>
          Compare the contracts each system exposes and the responsibilities it
          owns. AX operates around the agent process.
        </p>
      </div>
      <div className="filter-bar" aria-label="Comparison topics">
        {groups.map((g) => (
          <button
            key={g}
            aria-pressed={selected === g}
            onClick={() => onChange({ filter: g === "All" ? "" : g })}
          >
            {g}
          </button>
        ))}
      </div>
      <div
        className="comparison-scroll"
        role="region"
        aria-label="Harness comparison table"
        tabIndex={0}
      >
        <table className="comparison-table">
          <caption className="sr-only">
            Architecture comparison at the 2026-09-21 snapshot
          </caption>
          <thead>
            <tr>
              <th scope="col">Design question</th>
              {harnesses.map((h) => (
                <th scope="col" key={h.id}>
                  <a href={`#/learn/${h.id}`}>
                    <span
                      className="project-line"
                      style={{ background: h.color }}
                    />
                    {h.shortName}
                    <ArrowUpRight size={15} />
                  </a>
                  <small>{h.category}</small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisons
              .filter((d) => selected === "All" || d.group === selected)
              .map((d) => (
                <tr key={d.id}>
                  <th scope="row">
                    <strong>{d.title}</strong>
                    <small>{d.description}</small>
                  </th>
                  {harnesses.map((h) => (
                    <td key={h.id}>
                      <p>{d.findings[h.id].text}</p>
                      <SourceLinks ids={d.findings[h.id].sources} compact />
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="method-note">
        <Info size={19} />
        <p>
          A feature label does not establish production readiness. Read the
          source and its maturity note before drawing a conclusion about task
          performance.
        </p>
      </div>
    </div>
  );
}

export function EvolutionPage({ state, onChange }: Props) {
  const [until, setUntil] = useState(timeline.length - 1);
  const filter = harnesses.some((h) => h.id === state.filter)
    ? state.filter
    : "";
  const visible = timeline
    .slice(0, until + 1)
    .filter((event) => !filter || event.harness === filter);
  return (
    <div className="reference-page evolution-page">
      <div className="page-heading">
        <h1>
          How the pieces
          <br />
          came together.
        </h1>
        <p>
          A history of observable changes, interoperability and shared
          practices. Earlier public evidence does not establish invention.
        </p>
      </div>
      <div className="evolution-layout">
        <aside className="timeline-context">
          <h2>Read the history carefully</h2>
          <p>
            ZCode’s two-commit import limits feature dating. DeepSeek’s
            available history starts with capabilities already present. AX’s
            v0.3 rewrite changes its architectural layer.
          </p>
          <SourceLinks ids={["z-import", "d-start", "a-reset"]} compact />
          <h3>What is directly evidenced?</h3>
          <p>
            DeepSeek’s Codex hook bridge and Codex subagent provider demonstrate
            intentional interoperability.
          </p>
          <SourceLinks ids={["d-bridge", "d-codex-provider"]} compact />
          <h3>What is an inference?</h3>
          <p>
            Recurring skills, hooks, tool policies and persistent state show
            convergence. They do not by themselves show one team copied another.
          </p>
          <SourceLinks ids={["z-plugin", "c-hooks", "d-hooks"]} compact />
        </aside>
        <div className="timeline-content">
          <div className="filter-bar" aria-label="Timeline projects">
            <button
              aria-pressed={!filter}
              onClick={() => onChange({ filter: "" })}
            >
              All projects
            </button>
            {harnesses.map((h) => (
              <button
                key={h.id}
                aria-pressed={filter === h.id}
                onClick={() => onChange({ filter: h.id })}
              >
                {h.shortName}
              </button>
            ))}
          </div>
          <div className="time-control">
            <label htmlFor="time-until">
              History through <strong>{timeline[until].date}</strong>
            </label>
            <input
              id="time-until"
              type="range"
              min={0}
              max={timeline.length - 1}
              value={until}
              onChange={(e) => setUntil(Number(e.target.value))}
              aria-valuetext={timeline[until].date}
            />
            <span>{visible.length} documented milestones</span>
          </div>
          <ol className="timeline">
            {visible.map((event) => {
              const h = harnesses.find((x) => x.id === event.harness)!;
              return (
                <li
                  key={event.id}
                  className={
                    event.scope === "removal" ||
                    event.scope === "history-boundary"
                      ? "history-boundary"
                      : ""
                  }
                >
                  <div className="timeline-date">
                    <time dateTime={event.date}>{event.date}</time>
                    <span
                      style={{
                        color:
                          h.id === "zcode"
                            ? "#A3461C"
                            : h.id === "ax"
                              ? "#0C6960"
                              : h.color,
                      }}
                    >
                      {h.shortName}
                    </span>
                  </div>
                  <div className="timeline-event">
                    <span
                      className="timeline-point"
                      style={{ borderColor: h.color }}
                    >
                      {event.scope === "removal" ? (
                        <GitBranch size={15} />
                      ) : (
                        <GitCommitHorizontal size={15} />
                      )}
                    </span>
                    <span className="evidence-tag">
                      {event.scope === "removal"
                        ? "Architectural reset"
                        : event.auditability === "history-boundary"
                          ? "Public-history boundary"
                          : "Historical evidence"}
                    </span>
                    <h2>{event.title}</h2>
                    <p>{event.description}</p>
                    <SourceLinks ids={event.sourceIds} compact />
                  </div>
                </li>
              );
            })}
          </ol>
          {!visible.length && (
            <p className="empty-state">
              No milestones for this project before the selected date. Move the
              time slider forward or select another project.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function SourcesPage({ state, onChange }: Props) {
  const search = state.filter.toLowerCase();
  const matched = sources.filter((s) =>
    `${s.title} ${s.repository} ${s.path} ${s.evidence}`
      .toLowerCase()
      .includes(search),
  );
  return (
    <div className="reference-page sources-page">
      <div className="page-heading">
        <h1>
          Follow the explanation
          <br />
          back to the code.
        </h1>
        <p>
          Every source link names a revision. These records describe the public
          repositories as inspected on September 21, 2026.
        </p>
      </div>
      <div className="sources-layout">
        <aside className="source-method">
          <h2>How to read the evidence</h2>
          <dl className="evidence-definitions">
            <dt>Implemented</dt>
            <dd>Behavior observed in the inspected source.</dd>
            <dt>Documented</dt>
            <dd>A statement made by the project’s own documentation.</dd>
            <dt>Historical</dt>
            <dd>A commit or release establishes an observable change.</dd>
            <dt>Inferred</dt>
            <dd>Our architectural interpretation or task-fit judgment.</dd>
          </dl>
          <h3>Method</h3>
          <p>
            Read entrypoints, runtime loops, extension interfaces, state storage
            and execution boundaries. Compare docs with code and retain
            disagreements. Trace changes through available history.
          </p>
          <p>
            No controlled four-way benchmark was run. Popularity is not used as
            an architecture or maturity score.
          </p>
          <h3>Reuse and attribution</h3>
          <p>
            The Atlas is Apache-2.0 licensed. ZCode, Codex and AX use
            Apache-2.0; DeepSeek Harness uses MIT. Upstream licenses govern
            their code.
          </p>
          <a
            href="https://github.com/kenny2077/agent-harness-atlas/tree/main/research"
            target="_blank"
            rel="noreferrer"
          >
            Read the research notes <ArrowUpRight size={14} />
          </a>
        </aside>
        <div>
          <label className="search-field">
            <Search size={19} />
            <span className="sr-only">Search sources</span>
            <input
              type="search"
              value={state.filter}
              placeholder="Search source, project or path"
              onChange={(e) => onChange({ filter: e.target.value })}
            />
          </label>
          <p className="result-count" role="status">
            {matched.length} sources
          </p>
          <div className="source-index">
            {matched.map((s) => (
              <article key={s.id}>
                <div className="source-meta">
                  <span>{s.repository}</span>
                  <span className="evidence-tag">{s.evidence}</span>
                </div>
                <h2>
                  <a href={sourceUrl(s)} target="_blank" rel="noreferrer">
                    {s.title}
                    <ArrowUpRight size={17} />
                  </a>
                </h2>
                <code>{s.path || `${s.kind}/${s.commit.slice(0, 8)}`}</code>
                <small>
                  Revision {s.commit.slice(0, 8)}
                  {s.lineAnchor ? ` · ${s.lineAnchor}` : ""}
                </small>
              </article>
            ))}
          </div>
          {!matched.length && (
            <p className="empty-state">
              No matching sources. Try a project name such as “Codex” or a topic
              such as “hooks”.
            </p>
          )}
        </div>
      </div>
      <section className="glossary">
        <h2>A small field guide</h2>
        <dl>
          {glossary.map(([term, definition]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{definition}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
