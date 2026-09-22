import { describe, expect, it } from "vitest";
import { defaults, parseHash, serializeState } from "./state";

describe("shareable explorer state", () => {
  it("round-trips a complete lab selection", () => {
    const state = {
      ...defaults,
      harness: "codex" as const,
      chapter: "boundary",
      node: "sandbox",
      zoom: 140,
    };
    expect(parseHash(serializeState(state))).toEqual(state);
  });
  it("round-trips comparison filters and source queries", () => {
    for (const page of ["compare", "sources", "evolution"] as const) {
      const state = { ...defaults, page, filter: "MCP & skills / evidence" };
      expect(parseHash(serializeState(state))).toEqual(state);
    }
  });
  it("recovers from unknown routes and invalid zoom", () => {
    expect(parseHash("#/wrong/bad?zoom=NaN&overlay=bad")).toEqual(defaults);
    expect(parseHash("#/learn/codex?overlay=safety")).toEqual({ ...defaults, harness: "codex" });
    expect(parseHash("#/learn/ax?zoom=500").zoom).toBe(150);
    expect(parseHash("#/learn/ax?zoom=-50").zoom).toBe(60);
  });
});
