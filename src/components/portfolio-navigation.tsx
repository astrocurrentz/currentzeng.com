"use client";

import {
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
} from "react";
import styles from "./portfolio-overview.module.css";

type MenuSectionId = "engineering" | "area" | "resume" | "contact";
type ScrollTargetId = "landing" | MenuSectionId;

type MenuItem = {
  id: MenuSectionId;
  label: string;
};

const menuItems: readonly MenuItem[] = [
  { id: "engineering", label: "Engineering" },
  { id: "area", label: "Creative work" },
  { id: "resume", label: "Résumé" },
  { id: "contact", label: "Contact" },
];

const menuSectionIds = new Set<ScrollTargetId>([
  "landing",
  ...menuItems.map(({ id }) => id),
]);
const menuGapPx = 16;
const scrollTolerancePx = 1;
const contactReleaseDistancePx = 16;
const settledFrameCount = 2;
const maximumScrollDurationMs = 2400;

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.button !== 0 ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.shiftKey
  );
}

function getHashTarget(): ScrollTargetId | null {
  const id = decodeURIComponent(window.location.hash.slice(1));
  return menuSectionIds.has(id as ScrollTargetId)
    ? (id as ScrollTargetId)
    : null;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function PortfolioNavigation() {
  const navigationRef = useRef<HTMLElement>(null);
  const cancelActiveScrollRef = useRef<(() => void) | null>(null);

  const scrollToSection = useCallback(
    (
      sectionId: ScrollTargetId,
      options: { behavior: ScrollBehavior; focusTarget: boolean },
    ) => {
      const scrollRoot = document.querySelector<HTMLElement>(
        "[data-section-scroll-root]",
      );
      const target = document.querySelector<HTMLElement>(
        `[data-section-id="${sectionId}"]`,
      );

      if (!scrollRoot || !target) {
        return false;
      }

      cancelActiveScrollRef.current?.();
      delete scrollRoot.dataset.contactAnchored;
      scrollRoot.scrollTo({ behavior: "auto", top: scrollRoot.scrollTop });
      scrollRoot.dataset.menuScrolling = "true";
      scrollRoot.dataset.menuScrollTarget = sectionId;

      const rootRect = scrollRoot.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const naturalTargetTop =
        scrollRoot.scrollTop + targetRect.top - rootRect.top;
      let maximumTop = scrollRoot.scrollHeight - scrollRoot.clientHeight;
      let destinationTop = naturalTargetTop;

      if (sectionId === "engineering") {
        const navigationBottom =
          navigationRef.current?.getBoundingClientRect().bottom ?? rootRect.top;
        const menuClearance = navigationBottom - rootRect.top + menuGapPx;

        scrollRoot.style.setProperty(
          "--portfolio-menu-clearance",
          `${menuClearance}px`,
        );
        destinationTop -= menuClearance;
      } else if (sectionId === "contact") {
        destinationTop = maximumTop;
      }

      destinationTop = Math.min(Math.max(destinationTop, 0), maximumTop);

      let animationFrame = 0;
      let lastTop = scrollRoot.scrollTop;
      let stableFrames = 0;
      let isFinished = false;
      const startedAt = performance.now();

      const removeInterruptionListeners = () => {
        scrollRoot.removeEventListener("pointerdown", handleUserInterruption);
        scrollRoot.removeEventListener("touchstart", handleUserInterruption);
        scrollRoot.removeEventListener("wheel", handleUserInterruption);
      };

      const finish = (focusTarget: boolean, anchorContact = false) => {
        if (isFinished) {
          return;
        }

        isFinished = true;
        window.cancelAnimationFrame(animationFrame);
        removeInterruptionListeners();

        if (anchorContact) {
          scrollRoot.dataset.contactAnchored = "true";
          scrollRoot.scrollTo({
            behavior: "auto",
            top: scrollRoot.scrollHeight - scrollRoot.clientHeight,
          });
        }

        delete scrollRoot.dataset.menuScrolling;
        delete scrollRoot.dataset.menuScrollTarget;

        if (cancelActiveScrollRef.current === cancel) {
          cancelActiveScrollRef.current = null;
        }

        if (focusTarget) {
          target.focus({ preventScroll: true });
        }
      };

      const cancel = () => {
        scrollRoot.scrollTo({ behavior: "auto", top: scrollRoot.scrollTop });
        finish(false, false);
      };

      function handleUserInterruption() {
        cancel();
      }

      const trackScroll = (now: number) => {
        if (sectionId === "contact") {
          const liveMaximumTop =
            scrollRoot.scrollHeight - scrollRoot.clientHeight;

          if (
            Math.abs(liveMaximumTop - destinationTop) > scrollTolerancePx
          ) {
            maximumTop = liveMaximumTop;
            destinationTop = maximumTop;
            scrollRoot.scrollTo({
              behavior: options.behavior,
              top: destinationTop,
            });
          }
        }

        const currentTop = scrollRoot.scrollTop;
        const hasReachedTarget =
          Math.abs(currentTop - destinationTop) <= scrollTolerancePx;
        const hasStoppedMoving =
          Math.abs(currentTop - lastTop) <= scrollTolerancePx;

        stableFrames =
          hasReachedTarget && hasStoppedMoving ? stableFrames + 1 : 0;

        if (stableFrames >= settledFrameCount) {
          finish(options.focusTarget, sectionId === "contact");
          return;
        }

        if (now - startedAt >= maximumScrollDurationMs) {
          scrollRoot.scrollTo({ behavior: "auto", top: destinationTop });
          finish(options.focusTarget, sectionId === "contact");
          return;
        }

        lastTop = currentTop;
        animationFrame = window.requestAnimationFrame(trackScroll);
      };

      cancelActiveScrollRef.current = cancel;
      scrollRoot.addEventListener("pointerdown", handleUserInterruption, {
        passive: true,
      });
      scrollRoot.addEventListener("touchstart", handleUserInterruption, {
        passive: true,
      });
      scrollRoot.addEventListener("wheel", handleUserInterruption, {
        passive: true,
      });
      // Apply the temporary snap override before starting the browser animation.
      window
        .getComputedStyle(scrollRoot)
        .getPropertyValue("scroll-snap-type");
      scrollRoot.scrollTo({ behavior: options.behavior, top: destinationTop });
      animationFrame = window.requestAnimationFrame(trackScroll);

      return true;
    },
    [],
  );

  const handleClick = (
    event: MouseEvent<HTMLAnchorElement>,
    sectionId: MenuSectionId,
  ) => {
    if (isModifiedClick(event)) {
      return;
    }

    const didStartScroll = scrollToSection(sectionId, {
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      focusTarget: event.detail === 0,
    });

    if (!didStartScroll) {
      return;
    }

    event.preventDefault();
    const nextHash = `#${sectionId}`;

    if (window.location.hash !== nextHash) {
      window.history.pushState(null, "", nextHash);
    }
  };

  useEffect(() => {
    const initialTarget = getHashTarget();
    const scrollRoot = document.querySelector<HTMLElement>(
      "[data-section-scroll-root]",
    );
    let historyFrame = 0;
    let initialFrame = 0;

    const releaseContactAnchor = () => {
      if (scrollRoot?.dataset.contactAnchored !== "true") {
        return;
      }

      const maximumTop = scrollRoot.scrollHeight - scrollRoot.clientHeight;

      if (
        Math.abs(maximumTop - scrollRoot.scrollTop) >
        contactReleaseDistancePx
      ) {
        delete scrollRoot.dataset.contactAnchored;
      }
    };

    const keepContactAtDocumentEnd = () => {
      if (scrollRoot?.dataset.contactAnchored !== "true") {
        return;
      }

      scrollRoot.scrollTo({
        behavior: "auto",
        top: scrollRoot.scrollHeight - scrollRoot.clientHeight,
      });
    };

    const resizeObserver = new ResizeObserver(keepContactAtDocumentEnd);

    if (scrollRoot) {
      resizeObserver.observe(scrollRoot);
      for (const child of scrollRoot.children) {
        resizeObserver.observe(child);
      }
    }

    if (initialTarget) {
      initialFrame = window.requestAnimationFrame(() => {
        scrollToSection(initialTarget, {
          behavior: "auto",
          focusTarget: false,
        });
      });
    }

    const handlePopState = () => {
      const target = getHashTarget() ?? "landing";

      window.cancelAnimationFrame(historyFrame);
      historyFrame = window.requestAnimationFrame(() => {
        scrollToSection(target, {
          behavior: prefersReducedMotion() ? "auto" : "smooth",
          focusTarget: false,
        });
      });
    };

    window.addEventListener("popstate", handlePopState);
    scrollRoot?.addEventListener("scroll", releaseContactAnchor, {
      passive: true,
    });

    return () => {
      window.cancelAnimationFrame(initialFrame);
      window.cancelAnimationFrame(historyFrame);
      resizeObserver.disconnect();
      window.removeEventListener("popstate", handlePopState);
      scrollRoot?.removeEventListener("scroll", releaseContactAnchor);
      if (scrollRoot) {
        delete scrollRoot.dataset.contactAnchored;
        delete scrollRoot.dataset.menuScrollTarget;
      }
      cancelActiveScrollRef.current?.();
    };
  }, [scrollToSection]);

  return (
    <nav
      aria-label="Portfolio"
      className={styles.navigation}
      ref={navigationRef}
    >
      {menuItems.map(({ id, label }) => (
        <a href={`#${id}`} key={id} onClick={(event) => handleClick(event, id)}>
          {label}
        </a>
      ))}
    </nav>
  );
}
