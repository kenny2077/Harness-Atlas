# Research methodology

## Scope and snapshot

The comparison is frozen to 2026-09-21 and these exact revisions:

| Project | Revision |
|---|---|
| ZCode | [`872ad960de7ec172591f7e1952f7849229f94521`](https://github.com/zai-org/ZCode/tree/872ad960de7ec172591f7e1952f7849229f94521) |
| DeepSeek Harness | [`ddefc45fbc7f8e46dd73185e68295696d1297887`](https://github.com/deepseek-ai/deepseek-harness/tree/ddefc45fbc7f8e46dd73185e68295696d1297887) |
| OpenAI Codex | [`62ea6d41e85d0c75181f2794d0f2dc40e55fce3c`](https://github.com/openai/codex/tree/62ea6d41e85d0c75181f2794d0f2dc40e55fce3c) |
| Google AX | [`d8ed0fe38bceb7842d3c47817d53d16ccdfcb601`](https://github.com/google/ax/tree/d8ed0fe38bceb7842d3c47817d53d16ccdfcb601) |

Local pinned clones live under `.research/upstreams/`; `research/upstreams.json` is the machine-readable revision list.

## Source policy

The research uses only first-party material:

- Source code at the pinned revision.
- Repository-owned documentation and safety notices.
- Git commit history and release notes from the official repository.
- Repository metadata for license/language/status checks.

Blog posts, social media, third-party tutorials, search-result summaries, and popularity-based rankings are excluded from architectural claims.

## Evidence rules

1. Current behavior is supported by pinned code or documentation consistent with pinned code.
2. When documentation and implementation differ, the difference is stated. Example: AX v0.3 declares MCP/skill concepts, but its default workspace setup does not materialize registries or MCP configuration.
3. Historical behavior is labeled historical and linked to a tag or commit. It is not merged into the current architecture diagram.
4. Feature chronology means first auditable appearance in a repository's available public history, not global invention.
5. Task-fit, advantage, and cost statements are labeled architectural inference. No four-way controlled benchmark was found.
6. Security analysis separates policy/approval from containment. A prompt gate, workspace path, or worktree is not automatically an OS sandbox.
7. Release/package numbers are not treated as comparable maturity scales across projects.
8. Time-sensitive popularity counters are omitted.

## Reproducibility checks

- Confirm each local clone's `HEAD` equals `research/upstreams.json`.
- Prefer GitHub links containing the full commit SHA; use tag links only for explicitly historical/release material.
- For safety claims, inspect both the declared policy and the enforcement/adaptor path.
- For AX, compare the current v0.3 implementation with the rewrite commit and keep v0.2 sources in a separate historical section.
- For ZCode, state that its two-commit import prevents reconstruction of original feature dates.

## Limits

- Repository history can prove that a change appeared publicly by a date; it cannot prove the idea was invented there.
- Imported or squashed histories can hide earlier development.
- Presence in a schema or manifest does not prove a feature is operational.
- No benchmark evidence in these sources supports ranking coding quality, speed, reliability, or task success across the projects.
- The projects differ in layer: AX v0.3 is an orchestration substrate, while the other three implement end-user coding-agent loops.
