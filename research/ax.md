# Google AX source notes

Pinned snapshot: [`d8ed0fe38bceb7842d3c47817d53d16ccdfcb601`](https://github.com/google/ax/tree/d8ed0fe38bceb7842d3c47817d53d16ccdfcb601), released as [`v0.3.0`](https://github.com/google/ax/releases/tag/v0.3.0) on 2026-09-20. License: [Apache-2.0](https://github.com/google/ax/blob/d8ed0fe38bceb7842d3c47817d53d16ccdfcb601/LICENSE). The current implementation is predominantly Go.

## Current architecture: an orchestrator, not a coding-agent loop

AX v0.3 does not implement an end-user model/tool thought-action loop. It schedules and supervises arbitrary agent or harness processes in resumable Agent Substrate sandboxes.

```text
ax apply YAML
  -> stateless ax-server (gRPC)
  -> Redis resource hashes + task event stream
  -> ax-controller consumer group
  -> reconcile Atespace/template/actor + egress
  -> ax-task-runner PID 1
     -> prepare workspaces -> launch/supervise declared command
  -> status/watch via Redis; optional debug/ssh guest services
```

The public resources are `Task`, `Workspace`, `Gateway`, and `Model`. The server stores state in Redis rather than Kubernetes CRDs; horizontally scaled controllers consume Redis Streams and reconcile Agent Substrate objects ([design](https://github.com/google/ax/blob/d8ed0fe38bceb7842d3c47817d53d16ccdfcb601/DESIGN.md)).

The runner loads the task/workspaces, exposes metadata and readiness, prepares each workspace once, launches `spec.command`, and remains PID 1 after the child exits so inspection remains possible ([sandbox lifecycle](https://github.com/google/ax/blob/d8ed0fe38bceb7842d3c47817d53d16ccdfcb601/docs/sandbox.md)).

## Extensibility

The primary seam is the container/runner contract:

- Supply any image and command.
- Extend the default runner image.
- Embed the Go `runner.Run` package and use `OnCommandExit`.
- Replace the runner in another language while honoring the expected executable, HTTP, readiness, and environment contract ([runner guide](https://github.com/google/ax/blob/d8ed0fe38bceb7842d3c47817d53d16ccdfcb601/docs/runner.md)).

There is no current general plugin system or user-configurable hook lifecycle. `Workspace` schema includes skills and MCP declarations, but the default setup implementation clones Git repositories and creates the configured skills directory; it does not materialize skill registries or write MCP configuration ([setup implementation](https://github.com/google/ax/blob/d8ed0fe38bceb7842d3c47817d53d16ccdfcb601/internal/workspace/setup.go#L76-L127), [skill setup](https://github.com/google/ax/blob/d8ed0fe38bceb7842d3c47817d53d16ccdfcb601/internal/workspace/setup.go#L261-L269)). Documentation that says readiness follows MCP/skill setup is therefore ahead of the pinned default implementation.

## Safety and state

AX provides Agent Substrate actor isolation, resource requests/limits, Kubernetes secret references, durable volume snapshots, and Gateway egress rules. Debug guest services are disabled unless `spec.debug: true` because they permit arbitrary process execution and filesystem access inside the sandbox ([guest services](https://github.com/google/ax/blob/d8ed0fe38bceb7842d3c47817d53d16ccdfcb601/docs/sandbox.md#guest-services)).

The current controller has no working human-approval flow. `TaskStatus.PendingApproval` remains in the protocol, but the former task policy field is reserved and there is no approval RPC/controller path in the pinned implementation ([schema](https://github.com/google/ax/blob/d8ed0fe38bceb7842d3c47817d53d16ccdfcb601/pkg/apis/v1alpha1/ax.proto#L75-L135)). Without a restrictive Gateway, reconciliation defaults outbound access to `*:443` ([reconciler](https://github.com/google/ax/blob/d8ed0fe38bceb7842d3c47817d53d16ccdfcb601/internal/controller/reconciler.go#L188-L205)); that default should be shown separately from an explicitly allowlisted deployment.

Current state is resource/status/event state in Redis plus durable `/workspace` snapshots. There is no conversation/session abstraction or Web dashboard. The operator UX is CLI commands such as `apply`, `get`, `describe`, `watch`, `suspend`, `resume`, `delete`, and `ssh`.

The default runner logs child exit but stays alive; the pinned implementation does not reliably convert child success/failure into a terminal task status. This is useful for inspection but incomplete as job-completion semantics.

## Historical architecture must remain separate

The [2026-09-19 rewrite](https://github.com/google/ax/commit/dc4f36cdba647f110b34fd69adf31eb2bec37ca3) replaced the earlier v0.1–v0.2 conversation/harness system with the current declarative orchestrator. Historical AX had an Antigravity harness, conversation/event log, approval model, skill loaders, and a dashboard; those are not current v0.3 capabilities. The [v0.2.3 README](https://github.com/google/ax/blob/v0.2.3/README.md) is a historical source only.

Verified historical milestones include filesystem tools on [2026-02-17](https://github.com/google/ax/commit/ecaf5189a662c86668d6b4dd5563445bcac52dd4), session-recorded approval on [February 23](https://github.com/google/ax/commit/9c5a3d5bbe6eef2da0dc61c3ff36bf227caa48ca), a monitor dashboard on [June 17](https://github.com/google/ax/commit/da51f4b357e9c09c4dd34d016fa5a26cc92e778b), durable conversation resume on [July 1](https://github.com/google/ax/commit/b0e97874a68ab503a1ed42eadef1ffa9ad5eed20), and local skills on [July 28](https://github.com/google/ax/commit/f327e23b5b842e9b700675ded9a6cdb79c505856). The dashboard had already been removed on [July 22](https://github.com/google/ax/commit/c0d8e5bf10c2ae0ecfefa93bc9c727b7eeed9714).

## Development maturity and task fit

The API is `ax.io/v1alpha1`, and project documentation warns that core concepts and protocols may change. v0.3 is an architectural reset rather than a linear continuation of the old harness.

Architectural inference:

- Suitable for Kubernetes teams operating many isolated, suspendable agent workloads or evaluation jobs.
- Suitable for running different harnesses side-by-side through a common container contract.
- Not a substitute for a local coding assistant, model/tool loop, conversation UI, or current approval system.
- Requires Kubernetes, Agent Substrate, Redis, images/registry, and cluster access; current schema contains behavior not yet completed in the default runner.
