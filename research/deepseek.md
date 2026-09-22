# DeepSeek Harness source notes

Pinned snapshot: [`ddefc45fbc7f8e46dd73185e68295696d1297887`](https://github.com/deepseek-ai/deepseek-harness/tree/ddefc45fbc7f8e46dd73185e68295696d1297887), released as [`0.1.6-alpha.2`](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.1.6-alpha.2) on 2026-09-17. License: [MIT](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/LICENSE). The implementation is predominantly TypeScript, with React/Vite and Electron clients.

## Current architecture

The project's organizing rule is “everything is a plugin.” Cordis provides a context/plugin tree with typed services, events, scoped effects, and reversible registration. Providers, tools, prompts, persistence, and the default agent loop are composed capabilities rather than a fixed privileged core ([architecture](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/docs/architecture.md), [Cordis primer](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/docs/cordis-primer.md)).

```text
profile: Web | headless | SDK | ACP | sdk-minimal
  -> ordered bundle patches and overrides
  -> Cordis plugin tree
     ├─ agent loop + prompt/model routing
     ├─ append-only session events
     ├─ guarded tools + sandbox capability
     ├─ MCP/LSP/fs/shell/browser/computer seams
     ├─ subagents/teams/jobs/goals/plans
     └─ Web/Electron/headless/SDK/ACP carriers
```

Profiles are ordered bundle-patch stacks; user and invocation patches override lower layers, and HMR can recompose a running profile ([bundle map](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/packages/bundle/README.md)). The [package map](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/packages/README.md) spans 52 capability groups.

## Turn and tool execution

A step claims queued input, assembles prompt sections and tool schemas, applies `agent/pre-step`, resolves the model route, commits request facts, freezes model-visible history, streams the model, and durably settles the result. Tools pass through `tools/pre-execute -> execute -> post-execute`; parallel-safe calls use a bounded pool and exclusive calls form barriers. Tool results or inbox input continue the loop, followed by `agent/turn-stopping` ([turn flow](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/docs/architecture.md#turn-flow), [lifecycle](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/docs/agent-lifecycle.md)).

## Extensibility

Native Cordis waterfall/serial events can reject, rewrite, add context, or force continuation. Per-agent presets isolate tools, prompts, skills, and persona. External bundles can be installed and enabled for a profile; Web and agent tools expose the same manager operations.

Installed Host plugin code runs in-process with host-user permissions, outside the workspace sandbox. Profile changes affect every session using that profile, and package build-script approval is a separate host-level concern ([plugin manager](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/packages/boot/plugin-manager/README.md)). Failed removal may preserve partially completed changes; failed installation restores the manifest/lockfile but can leave downloaded files.

Compatibility bridges deliberately consume subsets of Codex and Claude Code `hooks.json`. The Codex bridge maps only part of Codex's event surface and runs shell-command handlers, so it should not be described as full hook compatibility ([Codex bridge](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/packages/hooks/hooks-codex/README.md)).

## Safety boundary

Modes are `read-only`, `workspace-write`, and `danger-full-access`. Local backends use Linux bubblewrap then Landlock, macOS Seatbelt, or Windows restricted-token/ACL enforcement; a denied confined call may retry through a one-time user-approved escalation ([sandbox group](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/packages/sandbox/README.md)).

The project explicitly says it is experimental, unaudited, and not production-ready. It warns that sandboxing, approvals, and permission controls reduce risk but do not guarantee isolation, and recommends a disposable VM, container, or dedicated environment for untrusted workloads ([SAFETY.md](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/SAFETY.md)).

## State and UI

An append-only `SessionEvent` log is the source of model context: model-visible information must be logged. Streaming chunks are transient, while settled model/tool outcomes are durable. JSONL generations are immutable and migrations preserve earlier generations. Resume, fork, projections, compression, titles, telemetry, and single-writer locking build on that log ([session packages](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/packages/session/README.md)).

The plugin-composed Web client includes conversation/trajectory, approvals, plans, goals, jobs, subagents, plugin management, terminal, previews, and changed-file review. Headless JSONL, TypeScript/Python SDKs, ACP, and Electron supply other carriers ([client map](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/packages/client/README.md)).

## Development maturity and task fit

The repository describes itself as a developer preview and every release through the pinned `0.1.6-alpha.2` is prerelease. Public history begins on [2026-06-10](https://github.com/deepseek-ai/deepseek-harness/commit/b67e81ac97647270b3002d78532baf3a5b68cbc3). It added a subagent seam on [June 21](https://github.com/deepseek-ai/deepseek-harness/commit/1a81f2cccdd49df5c5a25e208b61c8681d8207d5), shared Codex/Claude hook protocol on [July 1](https://github.com/deepseek-ai/deepseek-harness/commit/65165b5d542e6ff987e4d919d7f5d2f1fcaeaa2b), MCP/plan/skills/sandbox work on July 7–10, a plugin manager on [September 4](https://github.com/deepseek-ai/deepseek-harness/commit/dc969e2ee857a777ca9a5c9aa2b3f2bdaea13e19), and browser/computer backends on September 12.

Architectural inference:

- Suitable for studying or building deeply replaceable harnesses and differently composed agents in one process.
- Suitable for durable, inspectable sessions across Web, headless, SDK, and ACP surfaces.
- Carries substantial conceptual and operational load because composition, profiles, patches, presets, and many capability groups are all first-class.
- Requires careful plugin trust and should not be treated as production-hardened at this snapshot.
