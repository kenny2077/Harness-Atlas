import type { ExplorerState, ViewId } from "./content/types";

const views: ViewId[] = ["landscape", "zcode", "deepseek", "codex", "ax"];
export const defaults: ExplorerState = {
  page: "learn",
  harness: "landscape",
  chapter: "",
  node: "",
  overlay: "architecture",
  zoom: 100,
  filter: "",
};
export function parseHash(hash: string): ExplorerState {
  const [path, query = ""] = hash.replace(/^#\/?/, "").split("?");
  const [page, view] = path.split("/");
  const params = new URLSearchParams(query);
  const zoom = Number(params.get("zoom") || 100);
  return {
    page: ["compare", "evolution", "sources"].includes(page)
      ? (page as ExplorerState["page"])
      : "learn",
    harness: views.includes(view as ViewId) ? (view as ViewId) : "landscape",
    chapter: params.get("chapter") || "",
    node: params.get("node") || "",
    overlay: params.get("overlay") === "safety" ? "safety" : "architecture",
    zoom: Number.isFinite(zoom) ? Math.min(150, Math.max(60, zoom)) : 100,
    filter: params.get("filter") || "",
  };
}
export function serializeState(state: ExplorerState) {
  const params = new URLSearchParams();
  if (state.chapter) params.set("chapter", state.chapter);
  if (state.node) params.set("node", state.node);
  if (state.overlay !== "architecture") params.set("overlay", state.overlay);
  if (state.zoom !== 100) params.set("zoom", String(state.zoom));
  if (state.filter) params.set("filter", state.filter);
  const query = params.toString();
  return `#/${state.page}${state.page === "learn" ? `/${state.harness}` : ""}${query ? `?${query}` : ""}`;
}
