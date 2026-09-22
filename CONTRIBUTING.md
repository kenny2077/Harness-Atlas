# Contributing

Use Node.js 24 and `npm ci`. Keep changes focused on the Atlas teaching experience.

For factual changes, include a commit-pinned source reference. Record what the code does, what documentation claims, and any disagreement. Label task fit and trade-offs as inferences. A repository's first observable commit is not proof that a team invented a technique.

Content belongs in `src/content/` and supporting notes in `research/`. Preserve stable node, chapter and source identifiers whenever possible because they appear in shared URLs.

Run `npm run typecheck`, `npm test`, `npm run test:e2e`, and `npm run build`. Test keyboard interaction, reduced motion, desktop and mobile layouts for interface changes. The e2e suite uses one worker for memory-conscious local execution.

Do not commit `.research/`, credentials, personal configuration, generated previews or temporary screenshots. Do not bundle entire upstream repositories. Review licensing before adding excerpts or assets.

Pull requests deploy only after merging to `main` and passing verification. Contributions to the Atlas's original work are provided under Apache-2.0.
