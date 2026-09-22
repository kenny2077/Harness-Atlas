import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import App from "./App";

beforeEach(() => {
  window.location.hash = "#/learn/codex";
});
describe("student learning interactions", () => {
  it("collapses and restores the learning panel without losing the chapter", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Next step" }));
    const toggle = screen.getByRole("button", { name: "Collapse learning panel" });
    expect(toggle.closest("#learning-panel")).not.toBeNull();
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(toggle);
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next step" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Inspect Tool router" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Expand learning panel" })).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(screen.getByRole("button", { name: "Expand learning panel" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Before a tool runs");
  });
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
  it("shows architecture choices and advances chapters without a safety overlay", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: "Collapse architecture choices" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "ZCode" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Collapse architecture choices" }));
    expect(screen.queryByRole("button", { name: "ZCode" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Expand architecture choices" }));
    fireEvent.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Before a tool runs",
    );
    expect(screen.queryByRole("button", { name: "Safety" })).not.toBeInTheDocument();
    expect(screen.queryByText("The idea to take away")).not.toBeInTheDocument();
    expect(screen.queryByText(/Network policy, resource limits/)).not.toBeInTheDocument();
    expect(screen.queryByText("Design advantages")).not.toBeInTheDocument();
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
    expect(screen.queryByText(/Current architecture: v0.3/)).not.toBeInTheDocument();
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
