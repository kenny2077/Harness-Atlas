# Agent Harness Atlas

An interactive architecture lab for students studying [ZCode](https://github.com/zai-org/ZCode), [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness), [OpenAI Codex](https://github.com/openai/codex), and [Google AX](https://github.com/google/ax).

**[Open the Atlas](https://kenny2077.github.io/agent-harness-atlas/)**

Follow a request, select components, inspect their inputs and outputs, and open the pinned source. Compare designs, explore the feature timeline, or search the evidence index. The architecture stage supports pointer dragging, zoom/reset controls, keyboard traversal and a mobile component list.

## What the comparison means

The snapshot is dated **2026-09-21**. ZCode, DeepSeek and Codex are coding harnesses. AX v0.3 orchestrates task environments around arbitrary agent processes. Its placement around the other three is conceptual, not a tested integration.

Claims are labeled implemented, documented, historical or inferred. Task-fit judgments are architectural interpretations, not benchmark results. Public-history boundaries matter: ZCode has a two-commit source opening, DeepSeek's imported history begins with existing capabilities, and AX's v0.3 rewrite removed earlier built-in harness behavior.

## Run locally

Requires Node.js 24 and npm.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:5173/agent-harness-atlas/`. Hash routes preserve chapter and component links on GitHub Pages.

```sh
npm run typecheck
npm test
npx playwright install chromium
npm run test:e2e
npm run build
npm run preview
```

The build contains the self-hosted Recursive variable font. There are no runtime API requests, credentials, analytics or server dependencies.

## Research and refresh

```sh
npm run fetch:upstreams
npm run research:verify
```

The fetch script creates blob-filtered full-history clones under ignored `.research/upstreams/`, checks the pinned revisions in `research/upstreams.json`, and refuses to overwrite local changes. It does not install or build the upstream projects.

To prepare a new snapshot:

1. Choose and record the four full commit SHAs in the manifest.
2. Fetch and inspect the relevant loops, state, interfaces and execution boundaries.
3. Update `research/` notes and the JSON records in `src/content/`; add source references before changing claims.
4. Review removed, experimental and declaration-only features explicitly. Preserve historical evidence as historical.
5. Update the visible snapshot date, run verification and tests, and submit a pull request.

The site never silently changes its research at runtime. [Methodology](research/methodology.md) explains the evidence standard; [convergence](research/convergence.md) separates compatibility from causal influence.

## Structure

- `src/content/`: typed interfaces and curated data, independent of rendering.
- `src/components/`: the architecture stage, component inspector and reference views.
- `src/state.ts`: URL state parsing and serialization.
- `research/`: per-project notes, cross-project findings and pinned revisions.
- `e2e/`: desktop/mobile journeys, accessibility and responsive checks.

GitHub Actions verifies pull requests and pushes. Only verified `main` builds deploy to GitHub Pages; the site uses `/agent-harness-atlas/` as its base path.

## Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md). Include a primary source for factual corrections and separate observation from interpretation.

## License and credits

Original Atlas code and content: Apache-2.0. Upstream excerpts retain their original licenses and attributions. See [THIRD_PARTY.md](THIRD_PARTY.md) and [NOTICE](NOTICE).

The learning interaction was inspired by [Brendan Bycroft's LLM Visualization](https://bbycroft.net/llm). No code or visual assets from that project are copied into the site.
