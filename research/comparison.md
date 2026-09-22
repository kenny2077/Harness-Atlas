# Primary-source comparison: ZCode, DeepSeek Harness, OpenAI Codex, and Google AX

Research snapshot: **2026-09-21**. Sources are limited to the projects' own repositories, code, commit histories, releases, and official project documentation. Feature-fit judgments are labeled as architectural inferences; no repository publishes a controlled four-way benchmark.

## System boundary

Three projects are end-user coding-agent harnesses. Current Google AX is not.

```text
coding task -> model/tool loop -> local tools -> conversation UI
               ZCode | DeepSeek Harness | Codex

declarative Task -> distributed controller -> isolated container -> arbitrary harness process
                   current Google AX v0.3
```

AX v0.3 is a Kubernetes control plane for running arbitrary agent or harness processes. Its [2026-09-19 rewrite](https://github.com/google/ax/commit/dc4f36cdba647f110b34fd69adf31eb2bec37ca3) removed the earlier built-in Antigravity harness, conversation/event-log runtime, dashboard, approvals, and skill materializers. An educational comparison should make this layer distinction explicit rather than drawing four equivalent agent loops.

## Verified identity and maturity snapshot

| Project | Official repository | License | Dominant implementation | Public maturity evidence |
|---|---|---|---|---|
| ZCode | [zai-org/ZCode](https://github.com/zai-org/ZCode) | [Apache-2.0](https://github.com/zai-org/ZCode/blob/872ad960de7ec172591f7e1952f7849229f94521/LICENSE) | TypeScript (~33.6 MB; also Electron/React, JS/CSS and native helpers) | Repository created 2026-09-20; only [two public commits](https://github.com/zai-org/ZCode/commits/872ad960de7ec172591f7e1952f7849229f94521/) and no GitHub releases at snapshot time. Its internal package versions are not evidence of public-history maturity. |
| DeepSeek Harness | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) | [MIT](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/LICENSE) | TypeScript (~96.4% of language bytes); React/Vite and Electron | Current [`0.1.6-alpha.2`](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.1.6-alpha.2), 2026-09-17. The project calls itself a developer preview, unaudited, not production-ready, and warns of breaking changes in its [README](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/README.md) and [safety notice](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/SAFETY.md). |
| OpenAI Codex | [openai/codex](https://github.com/openai/codex) | [Apache-2.0](https://github.com/openai/codex/blob/62ea6d41e85d0c75181f2794d0f2dc40e55fce3c/LICENSE) | Rust (~67.5 MB; Python/TypeScript SDK and tooling) | Public history begins 2025-04, earlier than the other pinned repositories. Stable `0.155.1` released 2026-09-18 while `0.156.0-alpha.*` continued daily. |
| Google AX | [google/ax](https://github.com/google/ax) | [Apache-2.0](https://github.com/google/ax/blob/d8ed0fe38bceb7842d3c47817d53d16ccdfcb601/LICENSE) | Go (~95.3% of language bytes) | Current [`v0.3.0`](https://github.com/google/ax/releases/tag/v0.3.0), 2026-09-20, uses an unstable `ax.io/v1alpha1` API and warns that major concepts/protocols may break. v0.3 is a recent architectural reset. |

## Architecture and execution models

### ZCode: product workbench around an explicit TypeScript runtime

ZCode is a full product monorepo: Electron desktop, browser UI, HTTP/WebSocket server, shared React/Zustand UI, provider abstraction, and a terminal agent. Its [repository map](https://github.com/zai-org/ZCode/blob/872ad960de7ec172591f7e1952f7849229f94521/README.md#L206-L219) makes those layers explicit, and one `zcode` distribution starts TUI, Web, or the agent CLI ([README lines 84–105](https://github.com/zai-org/ZCode/blob/872ad960de7ec172591f7e1952f7849229f94521/README.md#L84-L105)).

```text
Electron Desktop ─┐
React Web ────────┼─ HTTP/WebSocket + shared RPC/client ─ Agent runtime
Ink-style TUI ────┘                                   ├─ provider adapters
                                                       ├─ model/turn state machine
                                                       ├─ tools + permission service
                                                       ├─ SQLite session/checkpoint state
                                                       └─ plugins/skills/hooks/MCP/workflows
```

Its turn loop is directly visible in [`runRegularTurnLoop`](https://github.com/zai-org/ZCode/blob/872ad960de7ec172591f7e1952f7849229f94521/apps/zcode-cli/packages/core/src/runtime/methods/turn-loop.ts#L43-L219). It repeatedly drains steering/runtime input, micro-compacts and auto-compacts history, initializes MCP, filters tools for the current mode, projects provider-visible messages, transitions the turn state machine into a model request, and executes one model-backed step. Tool scheduling then moves through permission and execution phases, persists calls/results, and feeds results into the next model round until no follow-up is required.

The public history cannot establish when those capabilities were originally built: commit [`77432b6`](https://github.com/zai-org/ZCode/commit/77432b6dbf9f70176ced3f4dcdc25f851c3acb2d) imported the code on 2026-09-20 and [`872ad96`](https://github.com/zai-org/ZCode/commit/872ad960de7ec172591f7e1952f7849229f94521) opened it on 2026-09-21.

### DeepSeek Harness: a microkernel where the loop is also a plugin

DeepSeek's defining design is literal “everything is a plugin.” Cordis supplies a context/plugin tree with typed services, typed events, and reversible registrations. Provider adapters, tools, persistence, prompt sections, and the agent loop itself are replaceable rather than privileged monolithic core code ([architecture](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/docs/architecture.md), [Cordis primer](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/docs/cordis-primer.md)).

```text
profile: web | headless | SDK | ACP | sdk-minimal
    -> ordered bundle patches + user/profile overlays
    -> Cordis context / plugin tree
       ├─ agents + replaceable loop
       ├─ append-only sessions
       ├─ prompt sections + model routes
       ├─ guarded tool pipeline
       ├─ fs/shell/sandbox/LSP/MCP/browser capability seams
       ├─ subagents/teams/jobs/goals/plans
       └─ Web/Headless/TS+Python SDK/ACP/Electron carriers
```

Profiles are ordered stacks of bundle patches; HMR can recompose them at runtime ([bundle map](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/packages/bundle/README.md)). The repository's [package map](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/packages/README.md) spans 52 capability groups and 291 second-level package directories.

A step claims user/steering input, assembles prompt/tool schemas, applies `agent/pre-step`, resolves a model route, commits request facts, freezes model history, streams the model, durably settles the response, and runs tool calls through `tools/pre-execute -> execute -> post-execute`. Parallel-safe tools use a bounded pool while exclusive tools form barriers. The loop repeats for tool results or inbox input, then runs `agent/turn-stopping` ([turn flow](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/docs/architecture.md#turn-flow), [lifecycle sequence](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/docs/agent-lifecycle.md)).

### OpenAI Codex: Rust core with a security boundary and multiple protocol clients

Codex centers a Rust session/turn core. A TUI, headless `exec`, JSON-RPC app server, IDE/desktop clients, and TypeScript/Python SDKs sit around it. The SDK is intentionally thin: it starts the CLI, consumes structured JSONL, and resumes persisted thread IDs.

```text
TUI | exec JSONL | app-server JSON-RPC | SDKs
           -> Session / TurnContext / rollout + SQLite state
              -> model sampling loop
                 -> tool router + ordered async tool futures
                    -> approval policy -> OS sandbox backend -> process/filesystem/network
              -> MCP + skills + hooks + plugins + subagents
```

The core documents its loop directly: a model tool call is executed and returned in the next sample; an assistant-only response completes the turn ([`run_turn`, lines 150–170](https://github.com/openai/codex/blob/62ea6d41e85d0c75181f2794d0f2dc40e55fce3c/codex-rs/core/src/session/turn.rs#L150-L170)). Before sampling it compacts, resolves required MCP/plugins, freezes exact step/world state, loads skills/plugins, and runs hooks ([lines 171–378](https://github.com/openai/codex/blob/62ea6d41e85d0c75181f2794d0f2dc40e55fce3c/codex-rs/core/src/session/turn.rs#L171-L378)). The inner loop drains steering between samples, streams responses, awaits ordered in-flight tools, and continues while tools or pending input require follow-up.

Codex exposes fewer core-replacement seams than DeepSeek's Cordis tree. It separately implements execution, protocol, persistence, and OS-sandbox layers.

### Google AX v0.3: distributed task reconciliation, not an agent thought loop

Current AX accepts declarative `Task`, `Workspace`, `Gateway`, and `Model` resources. It treats the actual agent as an opaque container command.

```text
ax apply YAML
  -> stateless gRPC ax-server
  -> Redis resource hashes + task event stream
  -> horizontally scalable ax-controller consumer group
  -> reconcile Agent Substrate atespace/template/actor + egress
  -> ax-task-runner (PID 1) prepares workspace and supervises command
  -> Redis status + WatchTask; optional ax ssh through router
```

Primary sources: [design](https://github.com/google/ax/blob/d8ed0fe38bceb7842d3c47817d53d16ccdfcb601/DESIGN.md), [worker loop](https://github.com/google/ax/blob/d8ed0fe38bceb7842d3c47817d53d16ccdfcb601/internal/controller/worker.go), [reconciler](https://github.com/google/ax/blob/d8ed0fe38bceb7842d3c47817d53d16ccdfcb601/internal/controller/reconciler.go), [runner](https://github.com/google/ax/blob/d8ed0fe38bceb7842d3c47817d53d16ccdfcb601/runner/runner.go), and [v1alpha1 schema](https://github.com/google/ax/blob/d8ed0fe38bceb7842d3c47817d53d16ccdfcb601/pkg/apis/v1alpha1/ax.proto).

## Extension, security, state, and UI comparison

| Dimension | ZCode | DeepSeek Harness | OpenAI Codex | Google AX v0.3 |
|---|---|---|---|---|
| Main extension seam | Installable plugin manifest and marketplaces. Components include agents, commands, `SKILL.md`, hooks, MCP, settings and dependencies ([manifest](https://github.com/zai-org/ZCode/blob/872ad960de7ec172591f7e1952f7849229f94521/apps/zcode-cli/packages/contracts/src/plugins/index.ts#L141-L161)). Also provider adapters, workflows and subagents. | Native Cordis plugins can replace nearly every capability. Profiles/bundles/presets compose different agents per session. Web installs/configures/live-toggles external bundles. | Layered `config.toml`/managed requirements, AGENTS.md, skills, MCP, hooks and installable plugins/marketplaces. Plugins group skills, apps/connectors, MCP and hooks. | Any image/command; extend or replace the runner if it honors its HTTP/readiness/env contract ([runner guide](https://github.com/google/ax/blob/d8ed0fe38bceb7842d3c47817d53d16ccdfcb601/docs/runner.md)). No general plugin system. |
| Hooks | Seven lifecycle events; command/process handlers can add context, rewrite input and participate in permission. Workspace-hook digest/trust is separate from plugin admission. | Rich typed waterfall/serial events; compatibility bridges deliberately consume subsets of Claude Code and Codex `hooks.json` ([hooks](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/packages/hooks/README.md)). | Twelve events, command and MCP handlers; can allow/deny/ask, rewrite input and add context ([event list](https://github.com/openai/codex/blob/62ea6d41e85d0c75181f2794d0f2dc40e55fce3c/codex-rs/hooks/src/lib.rs#L22-L53)). | No user-configurable lifecycle. `OnCommandExit` is the current runner callback. |
| MCP / skills reality | MCP stdio/HTTP/SSE/OAuth plus plugin/workspace configs; skill roots and marketplaces. | MCP and skills are native capability groups; preset isolation lets agents expose different sets. | MCP manager with stdio/streamable HTTP/OAuth/caching, skill discovery and explicit/implicit use, bundled/system skills. | MCP and skill registries exist in schema, but the current workspace setup does not materialize them or write MCP config. They are placeholders in the default implementation. |
| Execution safety | Permission modes/rules and workspace hook trust, **but no default OS sandbox in the shared execution adapter**. The official notice says file/terminal/Git run as the host account; noninteractive `--prompt` defaults to `yolo` when mode is omitted ([NOTICE lines 5–28](https://github.com/zai-org/ZCode/blob/872ad960de7ec172591f7e1952f7849229f94521/NOTICE.md#L5-L28)). | `read-only`, `workspace-write`, `danger-full-access`; Linux bwrap/Landlock, macOS Seatbelt, Windows token/ACL; one-time escalation. Project warns isolation is not guaranteed. External host plugins run in-process outside workspace sandbox. | Concrete OS-specific implementations: macOS Seatbelt; Linux bubblewrap with read-only `/`, writable roots, protected `.git/.codex`, PID/user/network namespaces, proxy/seccomp; Windows restricted/elevated/MXC backends. Approval, project trust, exec policy and managed constraints sit above it ([Linux details](https://github.com/openai/codex/blob/62ea6d41e85d0c75181f2794d0f2dc40e55fce3c/codex-rs/linux-sandbox/README.md#L24-L92)). | Container/Agent Substrate isolation, CPU/memory, durable snapshots, secret refs and egress allowlists. No current human-approval controller flow. Without a restrictive Gateway, egress defaults to `*:443`; debug guest services allow process/filesystem access inside the sandbox. |
| Session/state | SQLite (`~/.zcode/cli/db/db.sqlite`); session/message/tool/permission/checkpoint/queue state, restore/fork/rewind, memory and concurrent/background work. | Append-only `SessionEvent` log is model context; immutable JSONL generations, migrations, resume/fork/projections/compression/single-writer locking ([sessions](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/packages/session/README.md)). | JSONL rollouts under `~/.codex/sessions` plus SQLite index/state; resume/fork/archive/revert, compaction, world state and attachments. | No conversation/session abstraction. Redis stores resource/status/event state; `/workspace` survives suspend/resume via snapshots. |
| User surface | Electron desktop + React Web + terminal TUI; remote SSH/WSL/server and automations. | Plugin-composed React/Vite Web, Electron, headless JSONL, TS/Python SDK, ACP; trajectory, approvals, subagents, goals/plans/jobs, docked previews, terminal and changed-file review. | TUI, headless exec/JSONL, app-server for desktop/IDE, TS/Python SDKs. | CLI operator UX (`apply/get/describe/watch/suspend/resume/delete/ssh`); no current dashboard. |

## Likely strengths, weaknesses, and task fit

These are inferences from code and product boundaries, not comparative benchmark results.

### ZCode

**Likely fit:** a UI-rich local or remote coding workspace; teaching a complete desktop/web/TUI product; provider/plugin experimentation; scheduled and background work.

**Advantages:** includes first-party desktop, web, and TUI surfaces; uses TypeScript for most of the codebase; exposes its state machine and plugin lifecycle in source; combines provider abstraction, checkpoints, remote workspaces, browser use, workflows, subagents, and automations.

**Costs/risks:** only two public commits make provenance, regression history and original feature dates unauditable; very large Node/Electron monorepo; shared execution has no default OS sandbox; noninteractive default can be `yolo`; bundled Computer Use is explicitly a placeholder ([NOTICE line 24](https://github.com/zai-org/ZCode/blob/872ad960de7ec172591f7e1952f7849229f94521/NOTICE.md#L24)). Poorer fit for high-assurance execution of untrusted repositories unless externally contained.

### DeepSeek Harness

**Likely fit:** teaching/research on replaceable agent composition; custom enterprise/research harnesses; long-lived inspectable sessions; mixed Web/headless/SDK/ACP deployments; heterogeneous subagent orchestration.

**Advantages:** applies an “everything is a plugin” model consistently; model-visible state is durably logged; native typed interception supports more than its shell-command compatibility bridges; per-agent presets, UI inspection, and explicit compatibility adapters are first-class.

**Costs/risks:** self-described preview and unaudited; 52 capability groups/291 package directories create steep conceptual and operational load; breaking APIs and some experimental features; plugins execute in the host process; HMR can leave partial changes on activation/removal failure. No primary evidence supports claiming superior coding performance.

### OpenAI Codex

**Likely fit:** local coding where OS-level filesystem/network containment matters; headless/CI or SDK integration; deeply stateful coding tasks; teaching concrete sandbox and protocol boundaries.

**Advantages:** earliest-starting auditable public history among these pinned snapshots; detailed OS-specific sandbox implementations; explicit approval/config policy; Rust core; TUI/headless/app-server split; MCP, skills, hooks, plugins, persistent threads, and multi-agent behavior.

**Costs/risks:** a large Rust monorepo with substantial conceptual surface; difficult first read for students; rapid alpha-edge churn alongside stable releases; the broader app/IDE/cloud ecosystem extends beyond the simple local harness and may require OpenAI services.

### Google AX v0.3

**Likely fit:** infrastructure teams running many isolated, bursty or long-lived agent workloads on Kubernetes; evaluation farms; operating several different harnesses side-by-side; suspend/resume plus live inspection.

**Advantages:** clear control-plane/data-plane split; declarative resources; horizontally scalable Redis consumer group; framework- and language-neutral runner contract; durable workspaces and explicit egress/resource boundaries.

**Costs/risks:** poor fit for a solo student seeking a coding assistant; requires Kubernetes, Agent Substrate, Redis, images/registry and cluster access; no model/tool loop, conversation UI or current approval flow; current MCP/skills declarations are not materialized; current runner does not reliably translate child exit into completed task state; v0.3 has documentation/implementation drift. “Billions of tasks” is a design target, not a published benchmark result.

## Auditable feature timeline

The table says when a feature entered each project's **available public history**. It does not establish global invention.

| Date | Project | Auditable change |
|---|---|---|
| 2025-04-16 | Codex | [Initial public commit](https://github.com/openai/codex/commit/59a180ddec4adaf9760972cdb1eb89f06a81be8b). |
| 2025-05 (approximately) | Codex | A later [experimental RMCP client commit](https://github.com/openai/codex/commit/e555a36c6aa6e4dcc0f060418938a2f9349816c3) says Codex's own stdio MCP client work had started about five months earlier; exact origin should not be overclaimed. |
| 2025-05-23 | Codex | [Dedicated Linux sandbox crate added during a seccomp/Landlock overhaul](https://github.com/openai/codex/commit/89ef4efdcf033a3b0085328be5d144a292e5d50d). |
| 2025-09-29 | Codex | [TypeScript SDK scaffold](https://github.com/openai/codex/commit/adbc38a97871dcb472cccf5a349e0c3b0f11db13). |
| 2025-10-19 | Codex | [AGENTS.md discovery guide](https://github.com/openai/codex/commit/1d9b27387bc61a67d7f7caf0b153537565f31abc). |
| 2025-10-30 | Codex | [Windows Sandbox alpha](https://github.com/openai/codex/commit/87cce88f4865685a863e143e0fad4cf5ea542e62). |
| 2026-01-06 | Codex | [Agent controller](https://github.com/openai/codex/commit/1dd1355df3b4d33fe84de77b8a3efba1ce940d92), beginning the auditable collaboration/subagent line. |
| 2026-01-30 | Codex | [Plan mode items and TUI rendering](https://github.com/openai/codex/commit/ec4a2d07e411d11f4de13b4e09aa7386c914df6d). |
| 2026-01-31 | Codex | [Loading skills from `.agents/skills`](https://github.com/openai/codex/commit/39a6a84097ec4bdf180f42e5690f71159faa5670). |
| 2026-02-05 | Codex | [Initial hooks implementation wired to notify](https://github.com/openai/codex/commit/3b54fd733601cbc8bfc789cbcf82f7bd9dfa833b). |
| 2026-02-17 to 2026-07-28 | historical AX | Original planner gained [filesystem tools](https://github.com/google/ax/commit/ecaf5189a662c86668d6b4dd5563445bcac52dd4), [structured approval](https://github.com/google/ax/commit/9c5a3d5bbe6eef2da0dc61c3ff36bf227caa48ca), subagents, dashboard, durable conversations and skill registries/local sources. See [v0.2.3 README](https://github.com/google/ax/blob/v0.2.3/README.md). Most were later removed. |
| 2026-03-01 | Codex | [Initial plugin loading](https://github.com/openai/codex/commit/752402c4fe4cafec13b7f58e1c987230389df8af), followed in March by marketplaces/install UI and structured manifests. |
| 2026-06-10 | DeepSeek | [Initial imported history](https://github.com/deepseek-ai/deepseek-harness/commit/b67e81ac97647270b3002d78532baf3a5b68cbc3), already including AGENTS.md. |
| 2026-06-21 | DeepSeek | [Subagent capability seam](https://github.com/deepseek-ai/deepseek-harness/commit/1a81f2cccdd49df5c5a25e208b61c8681d8207d5). |
| 2026-07-01 | DeepSeek | [Shared Claude Code/Codex hook protocol](https://github.com/deepseek-ai/deepseek-harness/commit/65165b5d542e6ff987e4d919d7f5d2f1fcaeaa2b). |
| 2026-07-07 to 2026-07-10 | DeepSeek | [MCP client](https://github.com/deepseek-ai/deepseek-harness/commit/1fbe7c39d4cf934ecb5315cfa51eddb390340d30), [plan mode](https://github.com/deepseek-ai/deepseek-harness/commit/63ced3e0e2e47f7d7a375d11da1e5d9b165a5513), [skills](https://github.com/deepseek-ai/deepseek-harness/commit/6292d522362406d46ba5f74d7c0b3631dd6c0047), [cross-platform sandbox seam](https://github.com/deepseek-ai/deepseek-harness/commit/7b8c3a9b40b5e259484a627ee22284f8f710b7a1). |
| 2026-08-04 | DeepSeek | [Codex product subagent provider](https://github.com/deepseek-ai/deepseek-harness/commit/1daa35b6e3a8fca62b9e42abed6a0d8cfc6ce398): direct interoperability, not proof of copied internal architecture. |
| 2026-08-14 | DeepSeek | [Durable Agent Teams runtime](https://github.com/deepseek-ai/deepseek-harness/commit/3546f595b96ad1f1094a4b7a986333d6c299ebe2). |
| 2026-09-04 | DeepSeek | [First plugin manager implementation](https://github.com/deepseek-ai/deepseek-harness/commit/dc969e2ee857a777ca9a5c9aa2b3f2bdaea13e19). |
| 2026-09-12 | DeepSeek | [Computer use](https://github.com/deepseek-ai/deepseek-harness/commit/af4ad05845219691bef9b633f91cbd96cb89772e) and [browser use](https://github.com/deepseek-ai/deepseek-harness/commit/e1612c2fdc951b764336cd328662d015c9770d85). |
| 2026-09-19 | AX | [Wholesale v0.3 orchestrator rewrite](https://github.com/google/ax/commit/dc4f36cdba647f110b34fd69adf31eb2bec37ca3), deleting the older built-in harness/UI/approval design. |
| 2026-09-20/21 | ZCode | Imported and opened in two commits. Public history cannot date its internal features. |

## What “learned from each other” can and cannot be defended

### Direct primary-source evidence

1. DeepSeek Harness intentionally implements compatibility bridges for Codex and Claude Code hook files. Its Codex bridge is documented as partial and shell-command-only ([bridge docs](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/packages/hooks/hooks-codex/README.md)).
2. DeepSeek Harness can invoke Codex and Claude Code as subagent providers; the [Codex provider commit](https://github.com/deepseek-ai/deepseek-harness/commit/1daa35b6e3a8fca62b9e42abed6a0d8cfc6ce398) is explicit interoperability evidence.
3. Codex added an experimental client using the official RMCP SDK alongside its home-grown stdio client once that SDK matured ([commit](https://github.com/openai/codex/commit/e555a36c6aa6e4dcc0f060418938a2f9349816c3)). This proves ecosystem convergence around MCP, not influence from another compared harness; the commit did not yet remove the original client.
4. Historical AX explicitly credits earlier Google DeepMind distributed-harness work and GKE isolation/resumption work in its [v0.2.3 acknowledgements](https://github.com/google/ax/blob/v0.2.3/README.md#acknowledgements). No inspected AX source or history cites ZCode, DeepSeek Harness, or Codex as an influence.

### Convergence that is visible, but whose causal direction is not proven

MCP, skill directories, repository instructions, lifecycle hooks, tool approvals, sandbox modes, plan/read-only modes, context compaction, durable resume/fork, subagents, provider abstraction, headless protocol output, and multiple client surfaces recur across the coding harnesses. AX overlaps at a different layer through isolation, durable state, workspace preparation, declared MCP/skills and suspend/resume.

The safest teaching copy is:

> These projects converge on common agent-harness primitives. Codex has the earliest auditable public introduction among these repositories for several primitives; DeepSeek additionally builds explicit Codex/Claude compatibility bridges. Public history does not prove who invented the ideas or that one team copied another.

Do **not** say “Codex invented skills/hooks/plan mode,” “DeepSeek copied Codex,” or “ZCode introduced feature X first.” ZCode's two-commit import makes those priority claims impossible, and all of these ideas also exist in the wider ecosystem.

## Recommended visual/interactive information architecture

For the student-facing site, the evidence maps cleanly to five zoom levels:

1. **Landscape view:** put ZCode, DeepSeek and Codex inside a “coding harness” band; AX above them as “distributed runtime/control plane.”
2. **Request journey:** animate user input -> prompt assembly -> model -> tool proposal -> approval -> sandbox/execution -> result -> persistence -> next sample. Let AX switch to apply -> Redis event -> reconcile -> container runner.
3. **Component drill-down:** click a node to show responsibility, source path, inbound/outbound data, extension seam, failure modes and stable source link.
4. **Safety overlay:** color permission policy separately from actual containment. This prevents the common educational mistake of treating “approval” and “sandbox” as synonyms.
5. **Time slider:** show only auditable commits. Put a visible “history starts here” boundary on DeepSeek, and a stronger “two-commit source import; earlier dates unknown” boundary on ZCode. Show AX's v0.3 deletion/reset as a forked historical branch.

Useful side-by-side interactions are:

- Swap DeepSeek plugins to demonstrate a replaceable core.
- Toggle ZCode Desktop/Web/TUI while keeping one runtime/session model.
- Step through Codex approval -> concrete OS sandbox policy -> execution.
- Place Codex, ZCode, or DeepSeek conceptually *inside* an AX Task to show that AX operates one layer below/around the harness.
- Toggle “declared” versus “implemented” on AX MCP/skills, and “contract” versus “enforced” on ZCode sandbox metadata.

## Caveats to display on the site

- Current code, not marketing text, wins when documentation and implementation differ.
- Stars are not architecture or maturity metrics.
- “Feature exists” does not mean it is enabled, production-ready, or safely isolated.
- No comparative task-performance conclusions are supported without controlled evaluation.
- Repository opening date is not necessarily product birth date; it limits only what outsiders can audit.
