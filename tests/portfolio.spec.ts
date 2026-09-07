import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { resumeUrl } from "../src/config/portfolio";

async function openBazi(page: Page) {
  await page.goto("/#area");
  await page
    .getByRole("button", { name: "Open systems area", exact: true })
    .click();
  const trigger = page.getByRole("button", {
    name: "BaZi Atlas app preview",
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole("dialog", {
    name: "BaZi Atlas app demo",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  return { dialog, trigger };
}

test("landing navigation and direct engineering links expose real experience", async ({
  page,
}) => {
  await page.goto("/");
  const navigation = page.getByRole("navigation", {
    name: "Portfolio",
    exact: true,
  });
  await expect(
    page.getByText("QA engineer, software builder, and musician.", {
      exact: true,
    }),
  ).toBeInViewport();
  await navigation
    .getByRole("link", { name: "Engineering", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Engineering", exact: true }),
  ).toBeInViewport();
  await expect(
    page.getByRole("heading", { name: "QA automation & diagnostics" }),
  ).toBeVisible();
  await navigation.getByRole("link", { name: "Résumé", exact: true }).click();
  await expect(page.locator("#resume-heading")).toBeInViewport();
  await navigation.getByRole("link", { name: "Contact", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Email Current Zeng" }),
  ).toBeInViewport();
  await page.goto("/#engineering");
  await expect(
    page.getByRole("heading", { name: "Engineering", exact: true }),
  ).toBeInViewport();
});

test("all résumé downloads and the viewer use one working PDF", async ({
  page,
  request,
}) => {
  await page.goto("/#resume");
  const links = page.locator('a[href$=".pdf"]');
  expect(await links.count()).toBeGreaterThanOrEqual(4);
  for (const link of await links.all())
    await expect(link).toHaveAttribute("href", resumeUrl);
  await expect(page.locator('object[type="application/pdf"]')).toHaveAttribute(
    "data",
    resumeUrl,
  );
  const pdf = await request.get(resumeUrl);
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toContain("application/pdf");
  expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");
  await expect(
    page
      .getByRole("navigation", { name: "Résumé and project links" })
      .getByRole("link", { name: "Download résumé PDF" }),
  ).toBeVisible();
});

test("BaZi modal contains focus, labels inputs, and restores its trigger", async ({
  page,
}) => {
  const { dialog, trigger } = await openBazi(page);
  const close = dialog.getByRole("button", {
    name: "Close BaZi Atlas overlay",
  });
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    dialog.getByRole("link", { name: "Download BaZi Atlas on the App Store" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await dialog.getByRole("textbox", { name: "Year", exact: true }).fill("1990");
  await dialog
    .getByRole("combobox", { name: "Hour", exact: true })
    .selectOption("10");
  await expect(
    dialog.getByRole("combobox", { name: "Hour", exact: true }),
  ).toHaveValue("10");
  await expect(
    dialog
      .getByText(
        "Interactive UI preview with sample data. Changing inputs does not recalculate the chart.",
      )
      .first(),
  ).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Save image" })).toHaveCount(
    0,
  );
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("nested picker closes independently and clears selected glyphs", async ({
  page,
}) => {
  const { dialog } = await openBazi(page);
  await dialog
    .getByRole("button", { name: "Direct BaZi Entry", exact: true })
    .click();
  const trigger = dialog.getByRole("button", {
    name: "Select stem for Year",
    exact: true,
  });
  await trigger.click();
  const picker = page.getByRole("dialog", { name: "Select Stem - Year" });
  await expect(picker).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(picker).toHaveCount(0);
  await expect(dialog).toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await picker.getByRole("button", { name: "(jiǎ) 甲", exact: true }).click();
  await expect(trigger).toContainText("甲");
  await dialog.getByRole("button", { name: "Clear BaZi" }).click();
  await expect(trigger).toBeEmpty();
});

test("visual preview closes back to its project", async ({ page }) => {
  await page.goto("/#area");
  await page
    .getByRole("button", { name: "Open eyes area", exact: true })
    .click();
  const trigger = page.getByRole("button", {
    name: "Open Reindeer project",
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Reindeer", exact: true });
  await expect(
    dialog.getByRole("button", { name: "Close Reindeer project" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("engineering content reflows at narrow widths and enlarged text", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto("/#engineering");
  await page.addStyleTag({ content: "html { font-size: 200%; }" });
  const section = page.locator("#engineering");
  const overflow = await section.evaluate(
    (element) => element.scrollWidth > element.clientWidth + 1,
  );
  expect(overflow).toBe(false);
  await expect(
    page.getByRole("heading", { name: "Engineering", exact: true }),
  ).toBeInViewport();
});

test("reduced motion preserves readable text and key areas pass accessibility checks", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#engineering");
  const overview = await new AxeBuilder({ page })
    .include("#engineering")
    .analyze();
  expect(overview.violations).toEqual([]);
  const { dialog } = await openBazi(page);
  const input = dialog.getByRole("textbox", { name: "Year", exact: true });
  await input.fill("2000");
  const results = await new AxeBuilder({ page })
    .include("dialog[open]")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await expect(dialog.locator(".bazi-intro-text")).toContainText(
    "uses a Neo-Brutalist interface",
  );
  await expect(
    dialog.getByRole("button", { name: "Change BaZi preview color" }),
  ).toHaveCSS("transition-duration", "0s");
});

test("Freewill artwork picker is keyboard accessible and nested dismissal preserves the gallery", async ({
  page,
}) => {
  await page.goto("/#area");
  await page
    .getByRole("button", { name: "Open eyes area", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Open Freewill project", exact: true })
    .click();
  const gallery = page.getByRole("dialog", { name: "Freewill", exact: true });
  const menu = gallery.locator("summary");
  await menu.focus();
  await page.keyboard.press("Enter");
  const trigger = gallery.getByRole("button", {
    name: "Angels Are Alien Drones",
    exact: true,
  });
  await trigger.click();
  const artwork = page.getByRole("dialog", {
    name: "Angels Are Alien Drones artwork preview",
  });
  await expect(artwork).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(artwork).toHaveCount(0);
  await expect(gallery).toBeVisible();
  await expect(trigger).toBeFocused();
});

test("sample chart navigation changes the selected date and keyboard rotation works", async ({
  page,
}) => {
  const { dialog } = await openBazi(page);
  const date = dialog.locator(".bazi-almanac-date");
  const original = await date.textContent();
  await dialog.getByRole("button", { name: "Next day", exact: true }).click();
  await expect(date).not.toHaveText(original!);
  await dialog
    .getByRole("button", { name: "Previous day", exact: true })
    .click();
  await expect(date).toHaveText(original!);
  const donut = dialog.locator(".bazi-elements-donut-inner");
  const rotation = await donut.getAttribute("style");
  await dialog
    .getByRole("button", { name: "Rotate right", exact: true })
    .click();
  await expect(donut).not.toHaveAttribute("style", rotation!);
  const circle = dialog
    .getByRole("button", { name: /Move with arrow keys/ })
    .first();
  await circle.focus();
  const position = await circle.getAttribute("style");
  await page.keyboard.press("ArrowRight");
  await expect(circle).not.toHaveAttribute("style", position!);
});
