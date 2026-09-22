# ZCode source notes

Pinned snapshot: [`872ad960de7ec172591f7e1952f7849229f94521`](https://github.com/zai-org/ZCode/tree/872ad960de7ec172591f7e1952f7849229f94521), 2026-09-21. License: [Apache-2.0](https://github.com/zai-org/ZCode/blob/872ad960de7ec172591f7e1952f7849229f94521/LICENSE). The repository is predominantly TypeScript and combines Electron, React/Web, a server, a TUI, and an agent runtime.

## Current architecture

ZCode is an end-user coding workbench with three first-party surfaces over one runtime:

```text
Electron Desktop ─┐
React Web ────────┼─ HTTP/WebSocket + RPC/client ─ Agent runtime
Terminal TUI ─────┘                              ├─ provider adapters
                                                  ├─ turn state machine + tools
                                                  ├─ permission service
                                                  ├─ SQLite session/checkpoints
                                                  └─ plugins/skills/hooks/MCP/workflows
```

The repository map identifies the desktop, Web, server, shared UI, service/persistence, protocol/client, provider, and agent packages ([README](https://github.com/zai-org/ZCode/blob/872ad960de7ec172591f7e1952f7849229f94521/README.md#L206-L219)). One `zcode` distribution starts the TUI, browser workspace, or lower-level agent CLI ([README](https://github.com/zai-org/ZCode/blob/872ad960de7ec172591f7e1952f7849229f94521/README.md#L84-L105)).

## Turn and tool execution

[`runRegularTurnLoop`](https://github.com/zai-org/ZCode/blob/872ad960de7ec172591f7e1952f7849229f94521/apps/zcode-cli/packages/core/src/runtime/methods/turn-loop.ts#L43-L219) repeatedly:

1. Drains steering and background/runtime results.
2. Runs micro-compaction and context-limit compaction.
3. Initializes MCP and computes the visible tool set.
4. Adds mode, plan, todo, and output-style reminders.
5. Projects model-provider messages and starts a model request in the turn state machine.
6. Runs a model-backed step; tool results or pending input trigger another iteration.

Tool execution is modeled as scheduling, permission, execution, persistence, and result aggregation rather than a single blocking callback.

## Extensibility

The installable plugin manifest can declare agents, commands, hooks, MCP servers, skills, settings, dependencies, output styles, and user configuration ([plugin contract](https://github.com/zai-org/ZCode/blob/872ad960de7ec172591f7e1952f7849229f94521/apps/zcode-cli/packages/contracts/src/plugins/index.ts#L141-L161)). Marketplaces may come from URL, GitHub, Git, npm, file, or directory sources ([source types](https://github.com/zai-org/ZCode/blob/872ad960de7ec172591f7e1952f7849229f94521/apps/zcode-cli/packages/contracts/src/plugins/index.ts#L69-L79)).

The runtime also exposes provider adapters, dynamic workflows, subagents, commands, skills, and MCP transports. Hooks cover `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PermissionRequest`, `PostToolUse`, `PostToolUseFailure`, and `Stop`; handlers can execute commands/processes, add context, rewrite tool input, or participate in permission decisions ([official notice](https://github.com/zai-org/ZCode/blob/872ad960de7ec172591f7e1952f7849229f94521/NOTICE.md#L13-L22)).

## Safety boundary

ZCode has meaningful policy controls: tool capabilities, project allow/ask/deny rules, plan restrictions, per-session approvals, and tools that must always ask. `yolo` bypasses ordinary prompts when plan mode is off, while interactive and `alwaysAsk` tools retain gates ([permission service](https://github.com/zai-org/ZCode/blob/872ad960de7ec172591f7e1952f7849229f94521/apps/zcode-cli/packages/core/src/permission/service.ts#L97-L177)).

Those controls are not an OS sandbox. The project's notice says the shared execution adapter has no default operating-system sandbox; file, terminal, Git, agent tools, and external processes run with the executing account's permissions. It also says noninteractive `--prompt` defaults to `yolo` if no mode is supplied ([NOTICE](https://github.com/zai-org/ZCode/blob/872ad960de7ec172591f7e1952f7849229f94521/NOTICE.md#L5-L28)). Workspace identity, worktrees, browser-page separation, and Node REPL context must not be presented as system isolation.

Plugins and MCP can introduce processes, network calls, credentials, and hooks through admission paths distinct from workspace-hook trust ([NOTICE](https://github.com/zai-org/ZCode/blob/872ad960de7ec172591f7e1952f7849229f94521/NOTICE.md#L17-L20)). The bundled Computer Use package is a nonfunctional placeholder at this snapshot ([NOTICE](https://github.com/zai-org/ZCode/blob/872ad960de7ec172591f7e1952f7849229f94521/NOTICE.md#L23-L25)).

## State and UI

The independent CLI stores sessions in SQLite at `~/.zcode/cli/db/db.sqlite`; sessions include messages, tool/permission records, checkpoints, queues, and resumable work. The product supports restore, fork/rewind, memory, background tasks, and remote SSH/WSL workspaces. Memory defaults differ by entry point: enabled in the independent CLI and disabled in desktop settings ([data notice](https://github.com/zai-org/ZCode/blob/872ad960de7ec172591f7e1952f7849229f94521/NOTICE.md#L56-L64)).

## Development maturity and task fit

The visible feature surface is broad, but the public history has only two commits: an import on [2026-09-20](https://github.com/zai-org/ZCode/commit/77432b6dbf9f70176ced3f4dcdc25f851c3acb2d) and open-source publication on [2026-09-21](https://github.com/zai-org/ZCode/commit/872ad960de7ec172591f7e1952f7849229f94521). There were no GitHub releases in the pinned snapshot. Package version numbers therefore do not establish a public feature chronology.

Architectural inference:

- Suitable for studying a complete TypeScript desktop/Web/TUI coding product, provider abstraction, and plugin lifecycle.
- Suitable for interactive local/remote work where rich UI, checkpoints, workflows, and automation matter.
- Requires external containment when the task demands an OS-level boundary around untrusted code.
- Harder to study historically because original feature-introduction dates and regressions are absent from public history.
