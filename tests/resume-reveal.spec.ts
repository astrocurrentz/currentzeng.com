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

test("résumé is one section and reveals on a fixed timer", async ({
  isMobile,
  page,
}) => {
  test.skip(isMobile, "Desktop verifies that pointer movement cannot reveal it.");

  const section = await openResumeWithPausedClock(page);
  await expectFlushAlignment(page, "resume");
  const tracking = section.locator("[data-cursor-enabled]");
  const trackingBox = await tracking.boundingBox();

  await expect(page.locator('section[data-section-id="resume"]')).toHaveCount(
    1,
  );
  await expect(page.locator("#resume-intro")).toHaveCount(0);
  await expect(page.locator("[data-resume-entry-sentinel]")).toHaveCount(0);
  await expect(section).toHaveAttribute("data-resume-state", "hero");
  await expect(tracking).toHaveAttribute("data-cursor-enabled", "true");
  expect(trackingBox).not.toBeNull();

  const pointerPositions = [
    { x: 0.2, y: 0.25 },
    { x: 0.5, y: 0.45 },
    { x: 0.75, y: 0.65 },
  ] as const;

  for (const pointer of pointerPositions) {
    await page.mouse.move(
      trackingBox!.x + trackingBox!.width * pointer.x,
      trackingBox!.y + trackingBox!.height * pointer.y,
    );
    await page.clock.runFor(17);
    await expect(section).toHaveAttribute("data-resume-state", "hero");
  }

  await page.clock.runFor(2000);
  await expect(section).toHaveAttribute("data-resume-state", "hero");
  await page.clock.runFor(700);
  await expect(section).toHaveAttribute("data-resume-state", "transitioning");
  await page.clock.runFor(400);
  await expect(section).toHaveAttribute("data-resume-state", "content");
  await expect(page.locator("#resume-heading")).toBeVisible();
  await expect(page.locator("#resume-intro-heading")).not.toBeVisible();
});

test("résumé timer supports coarse pointers and reduced motion", async ({
  isMobile,
  page,
}) => {
  if (!isMobile) {
    await page.emulateMedia({ reducedMotion: "reduce" });
  }

  const section = await openResumeWithPausedClock(page);

  await expect(section).toHaveAttribute("data-resume-state", "hero");
  await page.clock.runFor(2000);
  await expect(section).toHaveAttribute("data-resume-state", "hero");
  await page.clock.runFor(700);
  await expect(section).toHaveAttribute(
    "data-resume-state",
    isMobile ? "transitioning" : "content",
  );
  await page.clock.runFor(400);
  await expect(section).toHaveAttribute("data-resume-state", "content");
  await expect(page.locator("#resume-heading")).toBeVisible();
});

test("Contact navigation bypasses the résumé hero during transit", async ({
  page,
}) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const scrollRoot = page.locator(scrollRootSelector);
  const resume = page.locator("#resume");

  await resume.evaluate((section) => {
    const observedWindow = window as typeof window & {
      resumeStateChanges?: string[];
      resumeStateObserver?: MutationObserver;
    };

    observedWindow.resumeStateChanges = [];
    observedWindow.resumeStateObserver = new MutationObserver(() => {
      observedWindow.resumeStateChanges?.push(
        section.getAttribute("data-resume-state") ?? "missing",
      );
    });
    observedWindow.resumeStateObserver.observe(section, {
      attributeFilter: ["data-resume-state"],
      attributes: true,
    });
  });

  await page
    .getByRole("navigation", { name: "Portfolio" })
    .getByRole("link", { name: "Contact", exact: true })
    .click();

  await expect(resume).toHaveAttribute("data-resume-state", "content");
  await expect(scrollRoot).toHaveAttribute("data-contact-anchored", "true", {
    timeout: 4000,
  });
  await page.waitForTimeout(3000);
  const stateChanges = await page.evaluate(() => {
    const observedWindow = window as typeof window & {
      resumeStateChanges?: string[];
      resumeStateObserver?: MutationObserver;
    };

    observedWindow.resumeStateObserver?.disconnect();
    return observedWindow.resumeStateChanges ?? [];
  });

  expect(stateChanges).toContain("content");
  expect(stateChanges).not.toContain("hero");
  expect(stateChanges).not.toContain("transitioning");
  await expect(resume).toHaveAttribute("data-resume-state", "content");
});

test("résumé hero resets after navigation and manual re-entry", async ({
  isMobile,
  page,
}) => {
  test.skip(isMobile, "Desktop navigation exercises timed reveal resets.");

  const section = await openResumeWithPausedClock(page);
  await page.clock.runFor(3000);
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
    scrollRoot.dispatchEvent(new Event("scroll"));
  });
  await page.clock.runFor(100);
  await expectFlushAlignment(page, "area");
  await expect(section).not.toHaveAttribute(
    "data-resume-entry-active",
    "true",
  );
  await page.locator(scrollRootSelector).evaluate((scrollRoot) => {
    const resume = document.querySelector<HTMLElement>("#resume");
    scrollRoot.scrollTo({ behavior: "auto", top: resume?.offsetTop ?? 0 });
    scrollRoot.dispatchEvent(new Event("scroll"));
  });
  await page.clock.runFor(100);
  await expect(section).toBeInViewport();
  await expect(section).toHaveAttribute("data-resume-entry-active", "true");
  await expect(section).toHaveAttribute("data-resume-state", "hero");
});

test("large and fractional scroll jumps cannot strand the résumé hero", async ({
  page,
}) => {
  await page.goto("/#area", { waitUntil: "domcontentloaded" });
  await expectFlushAlignment(page, "area");

  const section = page.locator("#resume");
  const scrollRoot = page.locator(scrollRootSelector);
  await expect(scrollRoot).not.toHaveAttribute("data-menu-scrolling", "true");

  await scrollRoot.evaluate((root) => {
    root.scrollTo({ behavior: "auto", top: root.scrollTop });
    root.style.scrollSnapType = "none";
  });
  await page.waitForTimeout(100);
  await scrollRoot.evaluate((root) => {
    const resume = document.querySelector<HTMLElement>("#resume");

    root.scrollTo({
      behavior: "auto",
      top: (resume?.offsetTop ?? 0) + 1.25,
    });
  });

  await expect(section).toHaveAttribute("data-resume-entry-active", "true");
  await expect(section).toHaveAttribute("data-resume-state", "hero");
  await expect(section).toHaveAttribute("data-resume-state", "content", {
    timeout: 4000,
  });

  await scrollRoot.evaluate((root) => {
    const area = document.querySelector<HTMLElement>("#area");
    root.scrollTo({ behavior: "auto", top: area?.offsetTop ?? 0 });
  });
  await expect(section).not.toHaveAttribute(
    "data-resume-entry-active",
    "true",
  );

  await scrollRoot.evaluate((root) => {
    const resume = document.querySelector<HTMLElement>("#resume");
    root.scrollTo({
      behavior: "auto",
      top: (resume?.offsetTop ?? 0) + 0.5,
    });
  });
  await expect(section).toHaveAttribute("data-resume-entry-active", "true");
  await expect(section).toHaveAttribute("data-resume-state", "hero");

  await page.waitForTimeout(500);
  await scrollRoot.evaluate((root) => {
    const area = document.querySelector<HTMLElement>("#area");
    root.scrollTo({ behavior: "auto", top: area?.offsetTop ?? 0 });
  });
  await expect(section).not.toHaveAttribute(
    "data-resume-entry-active",
    "true",
  );
  await page.waitForTimeout(2500);
  await expect(section).toHaveAttribute("data-resume-state", "hero");

  await scrollRoot.evaluate((root) => {
    const resume = document.querySelector<HTMLElement>("#resume");
    root.scrollTo({ behavior: "auto", top: resume?.offsetTop ?? 0 });
  });
  await expect(section).toHaveAttribute("data-resume-entry-active", "true");
  await expect(section).toHaveAttribute("data-resume-state", "content", {
    timeout: 4000,
  });
});
