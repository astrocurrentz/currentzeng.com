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

test("résumé hero runs once across navigation and manual re-entry", async ({
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
  await expect(section).not.toHaveAttribute(
    "data-resume-entry-active",
    "true",
  );
  await expect(section).toHaveAttribute("data-resume-state", "content");
});

test("résumé intro remains consumed after a reload in the same tab", async ({
  page,
}) => {
  const section = await openResumeWithPausedClock(page);
  await page.clock.runFor(3000);
  await expect(section).toHaveAttribute("data-resume-state", "content");

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.clock.runFor(100);

  await expect(page.locator("#resume")).toHaveAttribute(
    "data-resume-state",
    "content",
  );
  await expect(page.locator("#resume")).not.toHaveAttribute(
    "data-resume-entry-active",
    "true",
  );
});

test("a fresh browser tab session receives the résumé intro", async ({
  context,
}) => {
  const firstPage = await context.newPage();
  await firstPage.goto("/#resume", { waitUntil: "domcontentloaded" });
  await expect(firstPage.locator("#resume")).toHaveAttribute(
    "data-resume-state",
    "hero",
  );
  await firstPage.close();

  const secondPage = await context.newPage();
  await secondPage.goto("/#resume", { waitUntil: "domcontentloaded" });
  await expect(secondPage.locator("#resume")).toHaveAttribute(
    "data-resume-state",
    "hero",
  );
  await secondPage.close();
});

for (const destination of ["Creative work", "Engineering"]) {
  test(`Contact → ${destination} does not consume the résumé intro`, async ({ page }) => {
    await page.goto("/#contact", { waitUntil: "domcontentloaded" });
    const root = page.locator(scrollRootSelector);
    const section = page.locator("#resume");
    const navigation = page.getByRole("navigation", { name: "Portfolio", exact: true });
    await expect(root).toHaveAttribute("data-contact-anchored", "true");
    await section.evaluate((element) => {
      element.setAttribute("data-test-hero-activated", "false");
      new MutationObserver(() => {
        if (element.getAttribute("data-resume-state") !== "content") {
          element.setAttribute("data-test-hero-activated", "true");
        }
      }).observe(element, { attributes: true, attributeFilter: ["data-resume-state"] });
    });
    await navigation.getByRole("link", { name: destination, exact: true }).click();
    await expect(root).not.toHaveAttribute("data-menu-scrolling", "true");
    await expect(section).toHaveAttribute("data-test-hero-activated", "false");
    expect(await page.evaluate(() => sessionStorage.getItem("currentzeng:resume-intro:v1"))).toBeNull();
    await navigation.getByRole("link", { name: "Résumé", exact: true }).click();
    await expectFlushAlignment(page, "resume");
    await expect(section).toHaveAttribute("data-resume-entry-active", "true");
    await expect(section).toHaveAttribute("data-resume-state", "hero");
  });
}

test("consumed résumé stays content after reloading at Creative work", async ({ page }) => {
  await page.goto("/#resume", { waitUntil: "domcontentloaded" });
  const section = page.locator("#resume");
  await expect(section).toHaveAttribute("data-resume-entry-active", "true");
  await page.getByRole("navigation", { name: "Portfolio", exact: true })
    .getByRole("link", { name: "Creative work", exact: true }).click();
  await expectFlushAlignment(page, "area");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expectFlushAlignment(page, "area");
  await expect(section).toHaveAttribute("data-resume-state", "content");
});

test("scrolling up from Contact waits for the résumé entry band", async ({ page }) => {
  await page.goto("/#contact", { waitUntil: "domcontentloaded" });
  const root = page.locator(scrollRootSelector);
  const section = page.locator("#resume");
  await expect(root).toHaveAttribute("data-contact-anchored", "true");
  await root.evaluate((element) => {
    element.style.scrollSnapType = "none";
    element.scrollTo({ top: element.scrollTop - 40, behavior: "auto" });
  });
  await expect(root).not.toHaveAttribute("data-contact-anchored", "true");
  await expect(section).toHaveAttribute("data-resume-state", "content");
  expect(await page.evaluate(() => sessionStorage.getItem("currentzeng:resume-intro:v1"))).toBeNull();
  await root.evaluate((element) => {
    const resume = document.querySelector("#resume")!;
    element.scrollTo({ top: element.scrollTop + resume.getBoundingClientRect().top - element.getBoundingClientRect().top, behavior: "auto" });
  });
  await expect(section).toHaveAttribute("data-resume-entry-active", "true");
  await expect(section).toHaveAttribute("data-resume-state", "hero");
});

test("Contact-first navigation preserves the résumé intro", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const navigation = page.getByRole("navigation", { name: "Portfolio" });
  const section = page.locator("#resume");

  await navigation.getByRole("link", { name: "Contact", exact: true }).click();
  await expect(page.locator(scrollRootSelector)).toHaveAttribute(
    "data-contact-anchored",
    "true",
  );
  await expect(section).toHaveAttribute("data-resume-state", "content");
  await expect
    .poll(() =>
      page.evaluate(() =>
        sessionStorage.getItem("currentzeng:resume-intro:v1"),
      ),
    )
    .toBeNull();

  await navigation.getByRole("link", { name: "Résumé", exact: true }).click();
  await expectFlushAlignment(page, "resume");
  await expect(section).toHaveAttribute("data-resume-state", "hero");
  await expect(section).toHaveAttribute("data-resume-entry-active", "true");
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
  await expect(section).not.toHaveAttribute(
    "data-resume-entry-active",
    "true",
  );
  await expect(section).toHaveAttribute("data-resume-state", "content");

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
  await expect(section).toHaveAttribute("data-resume-state", "content");

  await scrollRoot.evaluate((root) => {
    const resume = document.querySelector<HTMLElement>("#resume");
    root.scrollTo({ behavior: "auto", top: resume?.offsetTop ?? 0 });
  });
  await expect(section).not.toHaveAttribute(
    "data-resume-entry-active",
    "true",
  );
  await expect(section).toHaveAttribute("data-resume-state", "content", {
    timeout: 4000,
  });
});
