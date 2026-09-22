import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";

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
  await page.goto("./#/learn/codex?chapter=boundary&overlay=safety");
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
