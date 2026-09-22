import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const base = "/Harness-Atlas/";
const html = readFileSync("dist/index.html", "utf8");
const assets = [...html.matchAll(/(?:src|href)="(\/Harness-Atlas\/[^\"]+)"/g)].map(
  ([, path]) => path,
);

assert.match(html, /\/Harness-Atlas\/assets\/[^\"]+\.js/);
assert.match(html, /\/Harness-Atlas\/assets\/[^\"]+\.css/);
assert.ok(assets.includes(`${base}favicon.svg`));
for (const path of assets) {
  assert.ok(existsSync(join("dist", path.slice(base.length))), `Missing built asset: ${path}`);
}
assert.doesNotMatch(html, /\/agent-harness-atlas\//);
console.log(`Verified ${assets.length} GitHub Pages asset paths.`);
