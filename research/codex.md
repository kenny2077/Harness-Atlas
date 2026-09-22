# OpenAI Codex source notes

Pinned snapshot: [`62ea6d41e85d0c75181f2794d0f2dc40e55fce3c`](https://github.com/openai/codex/tree/62ea6d41e85d0c75181f2794d0f2dc40e55fce3c). License: [Apache-2.0](https://github.com/openai/codex/blob/62ea6d41e85d0c75181f2794d0f2dc40e55fce3c/LICENSE). The core is a Rust monorepo with TypeScript/Python SDKs and supporting tooling.

## Current architecture

```text
TUI | headless exec/JSONL | app-server JSON-RPC | SDKs
  -> Session + TurnContext + rollout/SQLite state
     -> model sampling loop
        -> tool router + ordered asynchronous tool work
           -> approval/config policy -> OS sandbox -> process/filesystem/network
     -> MCP + skills + hooks + plugins + subagents
```

The TUI and headless runner use the same core. The app server exposes thread/session operations to desktop and IDE clients. The TypeScript SDK is a thin process/protocol wrapper around CLI JSONL and persisted thread IDs.

## Turn and tool execution

The source states the fundamental loop directly: when the model requests a function, Codex executes it and returns its output in the next sample; an assistant-only response completes the turn ([`run_turn`](https://github.com/openai/codex/blob/62ea6d41e85d0c75181f2794d0f2dc40e55fce3c/codex-rs/core/src/session/turn.rs#L150-L170)).

Before the first sample it may compact history, resolve required MCP servers/plugins, capture exact step and world state, build skill/plugin injections, and run session/prompt hooks ([turn preparation](https://github.com/openai/codex/blob/62ea6d41e85d0c75181f2794d0f2dc40e55fce3c/codex-rs/core/src/session/turn.rs#L171-L378)). The inner loop drains steering between samples, streams model output, awaits in-flight tool futures in order, and continues while tools or queued input require another request.

## Extensibility

Codex layers user/project configuration, managed requirements, AGENTS.md instructions, skills, MCP, hooks, plugins, and subagents. Its MCP manager supports local and remote transports, OAuth, discovery, and tool caching. Plugin manifests group skills, apps/connectors, MCP servers, hooks, and onboarding material; marketplaces add install/update policy.

The hook crate defines twelve events: `PreToolUse`, `PermissionRequest`, `PostToolUse`, `PreCompact`, `PostCompact`, `SessionStart`, `SessionEnd`, `UserPromptSubmit`, `SubagentStart`, `SubagentStop`, `Stop`, and `Interrupt` ([hook event list](https://github.com/openai/codex/blob/62ea6d41e85d0c75181f2794d0f2dc40e55fce3c/codex-rs/hooks/src/lib.rs#L22-L53)). Command and MCP handlers can change decisions/input or contribute context according to the event contract.

## Safety boundary

Approval policy, project trust, execution policy, permissions profiles, and managed constraints determine what is allowed or escalated. Actual confinement is OS-specific:

- Linux uses bubblewrap for filesystem-restricted policies. It makes `/` read-only, binds writable roots, re-applies protected `.git`/`.codex` paths as read-only, isolates user/PID namespaces, and can isolate or proxy the network with seccomp controls ([Linux sandbox](https://github.com/openai/codex/blob/62ea6d41e85d0c75181f2794d0f2dc40e55fce3c/codex-rs/linux-sandbox/README.md#L24-L92)). WSL1 is rejected for this path because required namespaces are unavailable.
- macOS uses [Seatbelt profiles](https://github.com/openai/codex/blob/62ea6d41e85d0c75181f2794d0f2dc40e55fce3c/codex-rs/sandboxing/src/seatbelt.rs).
- Windows routes configured modes to [restricted-token/elevated or MXC implementations](https://github.com/openai/codex/blob/62ea6d41e85d0c75181f2794d0f2dc40e55fce3c/codex-rs/core/src/config/windows_sandbox_config.rs).

These are implementation details, not a guarantee that every configured run is confined: selected sandbox/approval modes, writable roots, platform support, proxy policy, and explicit escalation determine the effective boundary.

## State and UI

Threads persist JSONL rollouts under `~/.codex/sessions` with SQLite-backed state/indexing. The system supports resume, fork, archive, revert, attachments, compaction, and persisted world/context state. User surfaces include the terminal TUI, headless `exec` with JSONL, the app-server protocol for richer clients, and SDK wrappers.

## Development maturity and task fit

The public history begins on [2025-04-16](https://github.com/openai/codex/commit/59a180ddec4adaf9760972cdb1eb89f06a81be8b), earlier than the other pinned repositories' auditable histories. Relevant public milestones include creation of the dedicated Linux sandbox crate on [2025-05-23](https://github.com/openai/codex/commit/89ef4efdcf033a3b0085328be5d144a292e5d50d), the TypeScript SDK scaffold on [2025-09-29](https://github.com/openai/codex/commit/adbc38a97871dcb472cccf5a349e0c3b0f11db13), an agent controller on [2026-01-06](https://github.com/openai/codex/commit/1dd1355df3b4d33fe84de77b8a3efba1ce940d92), plan items and TUI rendering on [January 30](https://github.com/openai/codex/commit/ec4a2d07e411d11f4de13b4e09aa7386c914df6d), loading skills from `.agents/skills` on [January 31](https://github.com/openai/codex/commit/39a6a84097ec4bdf180f42e5690f71159faa5670), the initial hooks implementation on [February 5](https://github.com/openai/codex/commit/3b54fd733601cbc8bfc789cbcf82f7bd9dfa833b), and initial plugin loading on [March 1](https://github.com/openai/codex/commit/752402c4fe4cafec13b7f58e1c987230389df8af).

Architectural inference:

- Suitable for local coding and automation where explicit approval and OS-level containment boundaries matter.
- Suitable for headless/CI integration and protocol-driven clients.
- Useful for studying persistent sessions, multi-agent coordination, and platform-specific sandbox implementation.
- The large Rust workspace and rapidly evolving app/plugin surface make it a demanding first codebase for students.
