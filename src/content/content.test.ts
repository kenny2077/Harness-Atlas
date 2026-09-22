import { describe, expect, it } from "vitest";
import { harnesses, sources, timeline, comparisons, sourceUrl } from "./index";

describe("published research integrity", () => {
  const knownSources = new Set(sources.map((s) => s.id));
  function checkSources(ids: string[]) {
    expect(ids.length).toBeGreaterThan(0);
    ids.forEach((id) =>
      expect(knownSources.has(id), `Unknown source ${id}`).toBe(true),
    );
  }
  it("keeps unique identifiers and immutable source revisions", () => {
    expect(knownSources.size).toBe(sources.length);
    for (const source of sources) {
      expect(source.commit).toMatch(/^[a-f0-9]{40}$/);
      expect(sourceUrl(source)).toContain(source.commit);
      if (source.kind !== "commit") expect(source.path).not.toBe("");
    }
  });
  for (const harness of harnesses)
    it(`${harness.name} has a connected, cited teaching graph`, () => {
      const ids = new Set(harness.nodes.map((n) => n.id));
      expect(ids.size).toBe(harness.nodes.length);
      for (const edge of harness.edges) {
        expect(ids.has(edge.from), edge.id).toBe(true);
        expect(ids.has(edge.to), edge.id).toBe(true);
      }
      for (const node of harness.nodes) {
        checkSources(node.sourceIds);
        checkSources(node.responsibility.sources);
        expect(
          harness.edges.some((e) => e.from === node.id || e.to === node.id),
          node.id,
        ).toBe(true);
        if (node.code) checkSources([node.code.source]);
      }
      for (const chapter of harness.chapters) {
        chapter.focus.forEach((id) =>
          expect(ids.has(id), `${chapter.id}: ${id}`).toBe(true),
        );
        checkSources(chapter.sourceIds);
      }
      [
        harness.summary,
        harness.maturity,
        ...harness.advantages,
        ...harness.tradeoffs,
        ...harness.taskFit,
      ].forEach((c) => checkSources(c.sources));
      harness.taskFit.forEach((c) => expect(c.evidence).toBe("inferred"));
    });
  it("keeps timeline events ordered and sourced", () => {
    expect(timeline.map((e) => e.date)).toEqual(
      timeline.map((e) => e.date).sort(),
    );
    timeline.forEach((e) => checkSources(e.sourceIds));
    expect(timeline.find((e) => e.id === "a-reset")?.scope).toBe("removal");
    expect(timeline.find((e) => e.id === "z-import")?.auditability).toBe(
      "history-boundary",
    );
  });
  it("covers every project for every comparison question", () => {
    comparisons.forEach((d) =>
      harnesses.forEach((h) => checkSources(d.findings[h.id].sources)),
    );
    expect(harnesses.find((h) => h.id === "ax")?.category).toBe(
      "Workload orchestrator",
    );
  });
});
