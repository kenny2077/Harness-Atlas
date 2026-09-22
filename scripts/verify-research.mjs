import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const manifest = JSON.parse(
  readFileSync(resolve(root, "research/upstreams.json"), "utf8"),
);
const sources = JSON.parse(
  readFileSync(resolve(root, "src/content/sources.json"), "utf8"),
);
let checked = 0;
for (const upstream of manifest.repositories) {
  const checkout = resolve(root, ".research/upstreams", upstream.id);
  if (!existsSync(resolve(checkout, ".git")))
    throw new Error(
      `Missing ${upstream.id}; run npm run fetch:upstreams first.`,
    );
  const git = (...args) =>
    execFileSync("git", ["-C", checkout, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  if (git("rev-parse", "HEAD") !== upstream.commit)
    throw new Error(`Unexpected revision for ${upstream.id}`);
  if (git("rev-parse", "--is-shallow-repository") !== "false")
    throw new Error(`Shallow history: ${upstream.id}`);
  for (const source of sources.filter((s) => s.harness === upstream.id)) {
    git(
      "cat-file",
      "-e",
      source.kind === "commit"
        ? `${source.commit}^{commit}`
        : `${source.commit}:${source.path}`,
    );
    if (source.lineAnchor) {
      const lines = git("show", `${source.commit}:${source.path}`).split(
        "\n",
      ).length;
      const lineNumbers = source.lineAnchor.match(/\d+/g).map(Number);
      if (lineNumbers.some((n) => n > lines))
        throw new Error(`Invalid source anchor: ${source.id}`);
    }
    checked++;
  }
}
console.log(
  `Verified ${checked} sources against four full-history pinned checkouts.`,
);
