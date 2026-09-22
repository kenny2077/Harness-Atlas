import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App";

beforeEach(() => {
  window.location.hash = "#/learn/codex";
});
describe("student learning interactions", () => {
  it("opens a component, exposes its pinned sources and restores focus", () => {
    render(<App />);
    const tool = screen.getByRole("button", { name: "Inspect Tool router" });
    tool.focus();
    fireEvent.click(tool);
    const panel = screen.getByRole("complementary", {
      name: "Tool router details",
    });
    expect(
      within(panel).getByRole("heading", { name: "Responsibility" }),
    ).toBeInTheDocument();
    expect(
      within(panel).getByRole("link", { name: /Rust session turn loop/ }),
    ).toHaveAttribute("href", expect.stringContaining("/blob/62ea6d41"));
    fireEvent.keyDown(panel, { key: "Escape" });
    expect(
      screen.queryByRole("complementary", { name: "Tool router details" }),
    ).not.toBeInTheDocument();
    expect(tool).toHaveFocus();
  });
  it("advances chapters and switches the safety overlay", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Before a tool runs",
    );
    fireEvent.click(screen.getByRole("button", { name: "Safety" }));
    expect(screen.getByText("Policy: may it run?")).toBeVisible();
    expect(window.location.hash).toContain("overlay=safety");
  });
  it("supports keyboard traversal of graph nodes", () => {
    render(<App />);
    const first = screen.getByRole("button", { name: "Inspect Terminal UI" });
    first.focus();
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(
      screen.getByRole("button", { name: "Inspect SDK / exec" }),
    ).toHaveFocus();
  });
  it("filters comparison dimensions", () => {
    window.location.hash = "#/compare";
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Safety" }));
    expect(
      screen.getByRole("rowheader", { name: /Containment/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("rowheader", { name: /Model loop/ }),
    ).not.toBeInTheDocument();
  });
  it("keeps AX current and historical scopes explicit", () => {
    window.location.hash = "#/learn/ax?chapter=evolution";
    render(<App />);
    expect(screen.getByText(/Current architecture: v0.3/)).toBeVisible();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Read history in context",
    );
  });
  it("restores a landscape component from its URL", () => {
    window.location.hash = "#/learn/landscape?node=ax-control";
    render(<App />);
    expect(
      screen.getByRole("complementary", { name: "AX control plane details" }),
    ).toBeInTheDocument();
  });
});
