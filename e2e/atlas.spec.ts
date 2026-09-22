import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";

test("architecture picker keeps the guided steps in view", async ({ page }, testInfo) => {
  await page.goto("./#/learn/codex");
  const picker = page.getByRole("button", { name: "Collapse architecture choices" });
  await expect(picker).toHaveAttribute("aria-expanded", "true");
  expect(await page.locator(".architecture-choices img").evaluateAll(
    (images) => images.length === 4 && images.every((image) => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0),
  )).toBe(true);
  await expect(page.getByRole("button", { name: "Safety", exact: true })).toHaveCount(0);
  if (testInfo.project.name === "desktop") {
    const pane = await page.locator("#learning-panel").boundingBox();
    const next = await page.getByRole("button", { name: "Next step" }).boundingBox();
    expect(next!.y + next!.height).toBeLessThanOrEqual(pane!.y + pane!.height + 1);
  }
  await picker.click();
  await expect(page.getByRole("button", { name: "ZCode", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Expand architecture choices" }).click();
  await page.getByRole("button", { name: "AX", exact: true }).click();
  await expect(page).toHaveURL(/learn\/ax/);
  await expect(page.getByRole("button", { name: "AX", exact: true })).toHaveAttribute("aria-pressed", "true");
});

test("dragging the panel divider resizes, collapses and restores its width", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Mobile uses a stacked layout");
  await page.goto("./#/learn/codex");
  const panel = page.locator("#learning-panel");
  const divider = page.getByRole("separator", { name: "Resize learning panel" });
  expect((await panel.boundingBox())!.width).toBeCloseTo(300, 0);
  const bounds = await divider.boundingBox();
  await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + 200);
  await page.mouse.down();
  await page.mouse.move(330, bounds!.y + 200, { steps: 8 });
  await page.mouse.up();
  expect((await panel.boundingBox())!.width).toBeCloseTo(330, 0);
  await page.mouse.down();
  await page.mouse.move(160, bounds!.y + 200, { steps: 8 });
  await page.mouse.up();
  await expect(panel).toBeHidden();
  await page.getByRole("button", { name: "Expand learning panel" }).click();
  expect((await panel.boundingBox())!.width).toBeCloseTo(330, 0);
  await divider.focus();
  await divider.press("ArrowRight");
  expect((await panel.boundingBox())!.width).toBeCloseTo(354, 0);
  await divider.press("Home");
  await expect(panel).toBeHidden();
  await expect(page.getByRole("button", { name: "Expand learning panel" })).toBeFocused();
  await page.getByRole("button", { name: "Expand learning panel" }).click();
  await divider.press("End");
  expect((await panel.boundingBox())!.width).toBeCloseTo(600, 0);
  const wideBounds = await divider.boundingBox();
  await page.mouse.move(wideBounds!.x + wideBounds!.width / 2, wideBounds!.y + 200);
  await page.mouse.down();
  await page.mouse.move(220, wideBounds!.y + 200, { steps: 8 });
  await page.mouse.up();
  expect((await panel.boundingBox())!.width).toBeCloseTo(250, 0);
  await divider.focus();
  await divider.press("ArrowRight");
  expect((await panel.boundingBox())!.width).toBeCloseTo(274, 0);
  await divider.press("ArrowLeft");
  expect((await panel.boundingBox())!.width).toBeCloseTo(250, 0);
  await divider.press("ArrowLeft");
  await expect(panel).toBeHidden();
  await page.getByRole("button", { name: "Expand learning panel" }).click();
  expect((await panel.boundingBox())!.width).toBeCloseTo(250, 0);
  expect(await panel.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
  await mkdir(".impeccable/review", { recursive: true });
  await page.screenshot({ path: ".impeccable/review/resized-panel.png", fullPage: true });
});

test("learning panel collapses with the keyboard and restores the chapter", async ({ page }, testInfo) => {
  await page.goto("./#/learn/codex");
  await page.getByRole("button", { name: "Next step" }).click();
  const stage = page.locator(".stage-wrap");
  const before = await stage.boundingBox();
  const toggle = page.getByRole("button", { name: /learning panel/ });
  await toggle.focus();
  await toggle.press("Enter");
  await expect(page.locator("#learning-panel")).toBeHidden();
  await expect(page.getByRole("button", { name: "Collapse architecture choices" })).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toBeFocused();
  await expect(page.getByRole("button", { name: "Inspect Tool router" })).toBeVisible();
  if (testInfo.project.name === "desktop") {
    const after = await stage.boundingBox();
    expect(after!.width).toBeGreaterThan(before!.width + 200);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await mkdir(".impeccable/review", { recursive: true });
  await page.screenshot({ path: `.impeccable/review/${testInfo.project.name}-collapsed.png`, fullPage: true });
  await toggle.press("Enter");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Before a tool runs");
  await expect(page.getByRole("button", { name: "Collapse architecture choices" })).toBeVisible();
});

test("landscape to source, chapter links and responsive layout", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("./#/learn/landscape");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Four systems.Two layers.",
  );
  await page.evaluate(() => document.fonts.ready);
  await mkdir(".impeccable/review", { recursive: true });
  await page.screenshot({
    path: `.impeccable/review/${testInfo.project.name}-landscape.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Explore a coding turn" }).click();
  await expect(page).toHaveURL(/learn\/codex/);
  await page
    .getByRole("button", { name: "Inspect Tool router", exact: true })
    .click();
  const inspector = page.getByTestId("component-inspector");
  await expect(
    inspector.getByRole("link", { name: /Rust session turn loop/ }),
  ).toHaveAttribute("href", /github.com\/openai\/codex\/blob\/[a-f0-9]{40}/);
  await page.getByRole("button", { name: "Close component details" }).click();
  await page.getByRole("button", { name: "Next step" }).click();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Before a tool runs",
  );
  await page.goto("./#/learn/codex");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: `.impeccable/review/${testInfo.project.name}.png`,
    fullPage: true,
  });
  if (testInfo.project.name === "desktop") {
    await page.setViewportSize({ width: 1586, height: 992 });
    await page.screenshot({
      path: ".impeccable/review/hero-repro.png",
      fullPage: false,
    });
    await page.setViewportSize({ width: 1440, height: 1000 });
  }
  for (const route of [
    "learn/landscape",
    "learn/zcode",
    "learn/deepseek",
    "learn/ax",
    "compare",
    "evolution",
    "sources",
  ]) {
    await page.goto(`./#/${route}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
      route,
    ).toBe(true);
    const a11y = await new AxeBuilder({ page }).analyze();
    expect(
      a11y.violations
        .filter((v) => v.impact === "serious" || v.impact === "critical")
        .map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
      route,
    ).toEqual([]);
  }
  expect(errors).toEqual([]);
});

test("keyboard, reduced motion and 200 percent text", async ({
  page,
}, testInfo) => {
  await page.goto("./#/learn/codex?chapter=boundary");
  const first = page.getByRole("button", { name: "Inspect Terminal UI" });
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("button", { name: "Inspect SDK / exec" }),
  ).toBeFocused();
  expect(
    await first.evaluate(
      (element) => getComputedStyle(element).transitionDuration,
    ),
  ).toBe("0s");
  const a11y = await new AxeBuilder({ page }).analyze();
  expect(
    a11y.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    ),
  ).toEqual([]);
  const textZoom = await page.addStyleTag({
    content: "html { font-size: 200% !important; }",
  });
  await expect(page.getByRole("button", { name: "Next step" })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `.impeccable/review/${testInfo.project.name}-text200.png`,
    fullPage: true,
  });
  await textZoom.evaluate((element) => element.remove());
  await page.getByRole("button", { name: "Inspect Tool router" }).click();
  const panel = page.getByTestId("component-inspector");
  if (testInfo.project.name === "mobile") {
    await expect(panel).toHaveAttribute("aria-modal", "true");
    await panel.getByRole("link").last().focus();
    await page.keyboard.press("Tab");
    await expect(
      panel.getByRole("button", { name: "Close component details" }),
    ).toBeFocused();
  }
  await page.screenshot({
    path: `.impeccable/review/${testInfo.project.name}-inspector.png`,
    fullPage: false,
  });
});
