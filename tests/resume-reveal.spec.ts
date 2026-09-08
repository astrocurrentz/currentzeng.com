import { expect, test, type Page } from "@playwright/test";

const scrollRootSelector = "[data-section-scroll-root]";

async function expectFlushAlignment(page: Page, sectionId: string) {
  await expect
    .poll(
      () =>
        page.locator(`#${sectionId}`).evaluate((section) => {
          const scrollRoot = document.querySelector(
            "[data-section-scroll-root]",
          );

          if (!(scrollRoot instanceof HTMLElement)) {
            return Number.POSITIVE_INFINITY;
          }

          return Math.abs(
            section.getBoundingClientRect().top -
              scrollRoot.getBoundingClientRect().top,
          );
        }),
      { timeout: 4000 },
    )
    .toBeLessThanOrEqual(2);
}

async function expectResumeMenuAlignment(page: Page) {
  await expect
    .poll(
      () =>
        page.locator("#resume").evaluate((section) => {
          const navigation = document.querySelector(
            'nav[aria-label="Portfolio"]',
          );

          if (!(navigation instanceof HTMLElement)) {
            return Number.POSITIVE_INFINITY;
          }

          const gap =
            section.getBoundingClientRect().top -
            navigation.getBoundingClientRect().bottom;
          return Math.abs(gap - 16);
        }),
      { timeout: 4000 },
    )
    .toBeLessThanOrEqual(2);
}

async function revealResumeWithPointer(page: Page) {
  const trackingBox = await page
    .locator("#resume [data-cursor-enabled]")
    .boundingBox();

  expect(trackingBox).not.toBeNull();
  for (const [x, y] of [
    [0.2, 0.2],
    [0.5, 0.5],
    [0.8, 0.7],
  ]) {
    await page.mouse.move(
      trackingBox!.x + trackingBox!.width * x,
      trackingBox!.y + trackingBox!.height * y,
    );
    await page.clock.runFor(17);
  }
}

async function openResumeWithPausedClock(page: Page) {
  const pausedTime = new Date("2026-09-07T12:00:00Z");
  await page.clock.install({ time: pausedTime });
  await page.clock.pauseAt(pausedTime);
  await page.goto("/#resume", { waitUntil: "domcontentloaded" });
  const section = page.locator("#resume");
  await expect(section).toHaveAttribute("data-resume-entry-active", "true");
  await page.clock.runFor(100);
  return section;
}

test("résumé is one section and reveals after three pointer updates", async ({
  isMobile,
  page,
}) => {
  test.skip(isMobile, "The three-movement reveal is desktop-only.");

  const section = await openResumeWithPausedClock(page);
  await expectResumeMenuAlignment(page);
  const tracking = section.locator("[data-cursor-enabled]");
  const trackingBox = await tracking.boundingBox();

  await expect(page.locator('section[data-section-id="resume"]')).toHaveCount(
    1,
  );
  await expect(page.locator("#resume-intro")).toHaveCount(0);
  await expect(section).toHaveAttribute("data-resume-state", "hero");
  await expect(tracking).toHaveAttribute("data-cursor-enabled", "true");
  expect(trackingBox).not.toBeNull();

  const pointerPositions = [
    { x: 0.2, y: 0.25 },
    { x: 0.5, y: 0.45 },
    { x: 0.75, y: 0.65 },
  ] as const;

  for (const [index, pointer] of pointerPositions.entries()) {
    await page.mouse.move(
      trackingBox!.x + trackingBox!.width * pointer.x,
      trackingBox!.y + trackingBox!.height * pointer.y,
    );
    await page.clock.runFor(17);
    await expect(section).toHaveAttribute(
      "data-resume-state",
      index < pointerPositions.length - 1 ? "hero" : "transitioning",
    );
  }

  await page.clock.runFor(400);
  await expect(section).toHaveAttribute("data-resume-state", "content");
  await expect(page.locator("#resume-heading")).toBeVisible();
  await expect(page.locator("#resume-intro-heading")).not.toBeVisible();
});

test("résumé inactivity fallback supports coarse pointers and reduced motion", async ({
  isMobile,
  page,
}) => {
  if (!isMobile) {
    await page.emulateMedia({ reducedMotion: "reduce" });
  }

  const section = await openResumeWithPausedClock(page);

  await expect(section).toHaveAttribute("data-resume-state", "hero");
  await page.clock.runFor(2399);
  await expect(section).toHaveAttribute("data-resume-state", "hero");
  await page.clock.runFor(1);
  await page.clock.runFor(400);
  await expect(section).toHaveAttribute("data-resume-state", "content");
  await expect(page.locator("#resume-heading")).toBeVisible();
});

test("résumé hero resets after navigation and manual re-entry", async ({
  isMobile,
  page,
}) => {
  test.skip(isMobile, "Desktop navigation exercises the pointer reveal.");

  const section = await openResumeWithPausedClock(page);
  await revealResumeWithPointer(page);
  await page.clock.runFor(400);
  await expect(section).toHaveAttribute("data-resume-state", "content");

  await page.emulateMedia({ reducedMotion: "reduce" });

  const navigation = page.getByRole("navigation", { name: "Portfolio" });
  await navigation
    .getByRole("link", { name: "Creative work", exact: true })
    .click();
  await page.clock.runFor(100);
  await expectFlushAlignment(page, "area");
  await navigation.getByRole("link", { name: "Résumé", exact: true }).click();
  await page.clock.runFor(100);
  await expect(section).toBeInViewport();
  await expect(page.locator(scrollRootSelector)).not.toHaveAttribute(
    "data-menu-scrolling",
    "true",
  );
  await expect(section).toHaveAttribute("data-resume-state", "hero");

  await page.clock.runFor(2500);
  await expect(section).toHaveAttribute("data-resume-state", "content");
  await page.locator(scrollRootSelector).evaluate((scrollRoot) => {
    const area = document.querySelector<HTMLElement>("#area");
    scrollRoot.scrollTo({ behavior: "auto", top: area?.offsetTop ?? 0 });
  });
  await expectFlushAlignment(page, "area");
  await expect(section).not.toHaveAttribute(
    "data-resume-entry-active",
    "true",
  );
  await page.locator(scrollRootSelector).evaluate((scrollRoot) => {
    const resume = document.querySelector<HTMLElement>("#resume");
    scrollRoot.scrollTo({ behavior: "auto", top: resume?.offsetTop ?? 0 });
  });
  await expect(section).toBeInViewport();
  await expect(section).toHaveAttribute("data-resume-entry-active", "true");
  await expect(section).toHaveAttribute("data-resume-state", "hero");
});
