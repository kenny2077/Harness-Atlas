# Feature convergence and influence

Snapshot date: 2026-09-21. All links are pinned primary sources or project commits. “First” below means first auditable appearance in these repositories, never global invention.

## Shared patterns

| Pattern | ZCode | DeepSeek Harness | OpenAI Codex | Google AX v0.3 |
|---|---|---|---|---|
| Model/tool loop | Current runtime; public introduction date unavailable ([loop](https://github.com/zai-org/ZCode/blob/872ad960de7ec172591f7e1952f7849229f94521/apps/zcode-cli/packages/core/src/runtime/methods/turn-loop.ts#L43-L219)) | Replaceable agent-loop plugin ([architecture](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/docs/architecture.md)) | Rust session/turn sampling loop ([source](https://github.com/openai/codex/blob/62ea6d41e85d0c75181f2794d0f2dc40e55fce3c/codex-rs/core/src/session/turn.rs#L150-L170)) | Not current; runs an opaque command in a sandbox. |
| MCP | stdio/HTTP/SSE/OAuth; date unknown | Client added [2026-07-07](https://github.com/deepseek-ai/deepseek-harness/commit/1fbe7c39d4cf934ecb5315cfa51eddb390340d30) | A later [experimental RMCP client commit](https://github.com/openai/codex/commit/e555a36c6aa6e4dcc0f060418938a2f9349816c3) says a home-grown stdio client had started about five months earlier | Declared in current schema/docs, not materialized by default workspace setup. |
| Skills | Current plugin/skill roots; date unknown | Catalog added [2026-07-10](https://github.com/deepseek-ai/deepseek-harness/commit/6292d522362406d46ba5f74d7c0b3631dd6c0047) | Loading from `.agents/skills` added [2026-01-31](https://github.com/openai/codex/commit/39a6a84097ec4bdf180f42e5690f71159faa5670) | Current setup creates a directory only; full loaders were historical v0.2 behavior. |
| Hooks | Seven current lifecycle events; date unknown | Native typed events plus Codex/Claude compatibility | Initial implementation [2026-02-05](https://github.com/openai/codex/commit/3b54fd733601cbc8bfc789cbcf82f7bd9dfa833b); twelve events at pin | No current user hook lifecycle; runner exposes `OnCommandExit`. |
| Plan/read-only mode | Present; date unknown | Added [2026-07-10](https://github.com/deepseek-ai/deepseek-harness/commit/63ced3e0e2e47f7d7a375d11da1e5d9b165a5513) | Plan items/TUI added [2026-01-30](https://github.com/openai/codex/commit/ec4a2d07e411d11f4de13b4e09aa7386c914df6d) | Not an agent-loop concern in v0.3. |
| Subagents | Present; date unknown | Capability seam added [2026-06-21](https://github.com/deepseek-ai/deepseek-harness/commit/1a81f2cccdd49df5c5a25e208b61c8681d8207d5) | Agent controller added [2026-01-06](https://github.com/openai/codex/commit/1dd1355df3b4d33fe84de77b8a3efba1ce940d92) | Historical harness had subagents; v0.3 can host any harness but does not supply subagent semantics. |
| Durable state | SQLite sessions/checkpoints | Append-only event log and immutable JSONL generations | JSONL rollouts plus SQLite state/index | Redis resource/events plus workspace snapshots, not conversations. |
| Containment and approvals | Tool permission policy; no default shared OS sandbox | Approval plus OS-specific sandbox backends; project warns not to rely on them alone | Approval/config policy plus OS-specific sandbox implementations | Container/actor isolation and egress; no current human-approval flow. |

## Direct evidence of interoperability or influence

The primary sources support only a narrow set of causal statements:

1. DeepSeek Harness intentionally reads subsets of Codex and Claude Code hook configuration. Its [Codex bridge](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/packages/hooks/hooks-codex/README.md) documents partial, shell-command-only compatibility.
2. DeepSeek Harness can launch Codex as a subagent provider. The [provider commit](https://github.com/deepseek-ai/deepseek-harness/commit/1daa35b6e3a8fca62b9e42abed6a0d8cfc6ce398) is explicit interoperability evidence, not proof that its internal architecture was copied.
3. Codex added an experimental client backed by the official Rust MCP SDK alongside its home-grown stdio client after the SDK matured ([commit](https://github.com/openai/codex/commit/e555a36c6aa6e4dcc0f060418938a2f9349816c3)). This is evidence of standards convergence; this commit did not yet replace the original client.
4. Historical AX credits earlier Google DeepMind distributed-harness work and GKE isolation/resumption work ([v0.2.3 acknowledgements](https://github.com/google/ax/blob/v0.2.3/README.md#acknowledgements)). The inspected AX history does not cite ZCode, DeepSeek Harness, or Codex as an influence.

No inspected primary source says ZCode copied another project, another project copied ZCode, or Codex originated the shared primitives.

## Chronology limits

- Codex has the earliest-starting auditable public history in this four-repository snapshot (2025-04-16).
- DeepSeek's visible history begins 2026-06-10 and may not cover private development before that point.
- ZCode exposes only a 2026-09-20 import and 2026-09-21 publication, so its internal feature dates cannot be reconstructed.
- AX's 2026-09-19 rewrite deletes or replaces much of the old harness; historical v0.2 behavior must not be presented as current v0.3 functionality.

## Safe wording for the educational site

> The projects converge on common agent-harness primitives: model/tool iteration, MCP, skills, hooks, approvals, durable state, compaction, and subagents. Codex has the earliest auditable public appearance among these repositories for several features; DeepSeek also implements explicit Codex/Claude interoperability. The public sources do not establish global invention or copying.

Avoid claims such as “Codex invented plan mode,” “DeepSeek copied Codex,” “ZCode introduced plugins first,” or “AX currently includes its old dashboard and approval loop.”
