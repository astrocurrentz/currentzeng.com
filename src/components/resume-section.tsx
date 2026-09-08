"use client";

import { Afacad_Flux } from "next/font/google";
import { motion } from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type FontVariationMapping,
  useVariableFontCursor,
  VariableFontAndCursor,
} from "@/components/fancy/text/variable-font-and-cursor";
import { designTokens } from "@/config/design-tokens";
import { projectLinks, resumeUrl } from "@/config/portfolio";
import { cx } from "@/lib/class-names";
import { defineCssVars } from "@/lib/css-vars";
import styles from "./resume-sections.module.css";

const resumeTitleFont = Afacad_Flux({
  axes: ["slnt"],
  display: "swap",
  subsets: ["latin"],
  weight: "variable",
});

const resumeSectionStyle = defineCssVars({
  "--resume-section-background": designTokens.colors.resumePaper,
  "--resume-section-foreground": designTokens.colors.brandRed,
  "--resume-section-min-block":
    designTokens.components.resumeSection.minBlockSize,
});

const resumeTitleFontVariationMapping = {
  x: {
    max: -14,
    min: 0,
    name: "slnt",
  },
  y: {
    max: 1000,
    min: 100,
    name: "wght",
  },
} as const satisfies FontVariationMapping;

const revealDelayMs = 2500;
const revealTransitionDurationMs = 400;

type ResumeRevealState = "hero" | "transitioning" | "content";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ResumeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackingRef = useRef<HTMLDivElement>(null);
  const revealStateRef = useRef<ResumeRevealState>("hero");
  const revealTimerRef = useRef<number | null>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const previousResumeTopRef = useRef<number | null>(null);
  const previousScrollTopRef = useRef<number | null>(null);
  const isInResumeBandRef = useRef(false);
  const isSuppressingForContactRef = useRef(false);
  const [revealState, setRevealState] =
    useState<ResumeRevealState>("hero");
  const { cursorX, cursorY, isActive, isEnabled, position } =
    useVariableFontCursor(trackingRef);

  const updateRevealState = useCallback((nextState: ResumeRevealState) => {
    revealStateRef.current = nextState;
    setRevealState(nextState);
  }, []);

  const clearRevealTimer = useCallback(() => {
    if (revealTimerRef.current === null) {
      return;
    }

    window.clearTimeout(revealTimerRef.current);
    revealTimerRef.current = null;
  }, []);

  const clearTransitionTimer = useCallback(() => {
    if (transitionTimerRef.current === null) {
      return;
    }

    window.clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = null;
  }, []);

  const beginReveal = useCallback(() => {
    if (revealStateRef.current !== "hero") {
      return;
    }

    clearRevealTimer();
    clearTransitionTimer();

    if (prefersReducedMotion()) {
      updateRevealState("content");
      return;
    }

    updateRevealState("transitioning");
    transitionTimerRef.current = window.setTimeout(() => {
      transitionTimerRef.current = null;
      updateRevealState("content");
    }, revealTransitionDurationMs);
  }, [clearRevealTimer, clearTransitionTimer, updateRevealState]);

  const scheduleReveal = useCallback(() => {
    clearRevealTimer();
    revealTimerRef.current = window.setTimeout(() => {
      revealTimerRef.current = null;
      beginReveal();
    }, revealDelayMs);
  }, [beginReveal, clearRevealTimer]);

  const resetForEntry = useCallback(() => {
    clearRevealTimer();
    clearTransitionTimer();
    updateRevealState("hero");
    scheduleReveal();
  }, [
    clearRevealTimer,
    clearTransitionTimer,
    scheduleReveal,
    updateRevealState,
  ]);

  const showContentWithoutReveal = useCallback(() => {
    clearRevealTimer();
    clearTransitionTimer();
    updateRevealState("content");
  }, [clearRevealTimer, clearTransitionTimer, updateRevealState]);

  useEffect(() => {
    const section = sectionRef.current;
    const scrollRoot = document.querySelector<HTMLElement>(
      "[data-section-scroll-root]",
    );

    if (!section || !scrollRoot) {
      return;
    }

    const readPosition = () => {
      const rootRect = scrollRoot.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      const entryBandTop = rootRect.top;
      const entryBandBottom = rootRect.top + rootRect.height * 0.25;

      return {
        entryBandBottom,
        entryBandTop,
        isSectionVisible:
          sectionRect.bottom > rootRect.top &&
          sectionRect.top < rootRect.bottom,
        isTopInBand:
          sectionRect.top >= entryBandTop &&
          sectionRect.top <= entryBandBottom,
        resumeTop: sectionRect.top,
        scrollTop: scrollRoot.scrollTop,
      };
    };

    const activateEntry = () => {
      isInResumeBandRef.current = true;
      section.dataset.resumeEntryActive = "true";
      resetForEntry();
    };

    const deactivateEntry = () => {
      isInResumeBandRef.current = false;
      delete section.dataset.resumeEntryActive;
      clearRevealTimer();
      clearTransitionTimer();
      updateRevealState("hero");
    };

    const suppressForContact = () => {
      isSuppressingForContactRef.current = true;
      isInResumeBandRef.current = false;
      delete section.dataset.resumeEntryActive;
      showContentWithoutReveal();
    };

    const processScrollPosition = () => {
      scrollFrameRef.current = null;

      const position = readPosition();
      const previousTop = previousResumeTopRef.current;
      const previousScrollTop = previousScrollTopRef.current;
      const isContactNavigation =
        scrollRoot.dataset.menuScrollTarget === "contact";
      const isContactAnchored =
        scrollRoot.dataset.contactAnchored === "true";

      if (isContactNavigation || isContactAnchored) {
        suppressForContact();
        previousResumeTopRef.current = position.resumeTop;
        previousScrollTopRef.current = position.scrollTop;
        return;
      }

      const suppressionEnded = isSuppressingForContactRef.current;
      isSuppressingForContactRef.current = false;

      const enteredBand =
        position.isTopInBand &&
        (previousTop === null ||
          previousTop < position.entryBandTop ||
          previousTop > position.entryBandBottom);
      const crossedBandDownward =
        previousTop !== null &&
        previousTop > position.entryBandBottom &&
        position.resumeTop < position.entryBandTop;
      const initializedWithinResume =
        previousTop === null && position.isSectionVisible;
      const interruptedContactWithinResume =
        suppressionEnded && position.isSectionVisible;
      const backedOutUpward =
        previousScrollTop !== null &&
        position.scrollTop < previousScrollTop - 1 &&
        position.resumeTop > position.entryBandBottom;

      if (
        enteredBand ||
        crossedBandDownward ||
        initializedWithinResume ||
        interruptedContactWithinResume
      ) {
        activateEntry();
      } else if (backedOutUpward) {
        // Only backing out toward earlier sections cancels an active entry.
        // A downward overshoot keeps the timer alive so the hero cannot stick.
        deactivateEntry();
      }

      previousResumeTopRef.current = position.resumeTop;
      previousScrollTopRef.current = position.scrollTop;
    };

    const schedulePositionCheck = () => {
      if (scrollFrameRef.current !== null) {
        return;
      }

      scrollFrameRef.current = window.requestAnimationFrame(
        processScrollPosition,
      );
    };

    const synchronizeNavigationTarget = () => {
      if (
        scrollRoot.dataset.menuScrollTarget === "contact" ||
        scrollRoot.dataset.contactAnchored === "true"
      ) {
        suppressForContact();
        const position = readPosition();
        previousResumeTopRef.current = position.resumeTop;
        previousScrollTopRef.current = position.scrollTop;
        return;
      }

      processScrollPosition();
    };

    const navigationObserver = new MutationObserver(
      synchronizeNavigationTarget,
    );

    scrollRoot.addEventListener("scroll", schedulePositionCheck, {
      passive: true,
    });
    navigationObserver.observe(scrollRoot, {
      attributeFilter: [
        "data-contact-anchored",
        "data-menu-scroll-target",
      ],
      attributes: true,
    });
    processScrollPosition();

    return () => {
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }

      scrollRoot.removeEventListener("scroll", schedulePositionCheck);
      navigationObserver.disconnect();
      delete section.dataset.resumeEntryActive;
      previousResumeTopRef.current = null;
      previousScrollTopRef.current = null;
      isInResumeBandRef.current = false;
      isSuppressingForContactRef.current = false;
      clearRevealTimer();
      clearTransitionTimer();
    };
  }, [
    clearRevealTimer,
    clearTransitionTimer,
    resetForEntry,
    showContentWithoutReveal,
    updateRevealState,
  ]);

  const isContentAccessible = revealState === "content";

  return (
    <section
      aria-labelledby={
        isContentAccessible ? "resume-heading" : "resume-intro-heading"
      }
      className={styles.resumeSection}
      data-resume-state={revealState}
      data-section-id="resume"
      id="resume"
      ref={sectionRef}
      style={resumeSectionStyle}
      tabIndex={-1}
    >
      <div
        aria-hidden={isContentAccessible ? true : undefined}
        className={styles.resumeHero}
      >
        <div
          className={styles.resumeIntroTracking}
          data-cursor-active={isActive}
          data-cursor-enabled={isEnabled}
          ref={trackingRef}
        >
          <span
            aria-hidden="true"
            className={styles.resumeCursor}
            data-resume-cursor-layer
          >
            <motion.span
              className={cx(
                styles.resumeCursorGuide,
                styles.resumeCursorVertical,
              )}
              data-resume-cursor="vertical"
              style={{ x: cursorX }}
            />
            <motion.span
              className={cx(
                styles.resumeCursorGuide,
                styles.resumeCursorHorizontal,
              )}
              data-resume-cursor="horizontal"
              style={{ y: cursorY }}
            />
            <motion.span
              className={styles.resumeCursorSquarePosition}
              data-resume-cursor="square"
              style={{ x: cursorX, y: cursorY }}
            >
              <span className={styles.resumeCursorSquare} />
            </motion.span>
          </span>
          <h2
            className={cx(styles.resumeIntroTitle, resumeTitleFont.className)}
            id="resume-intro-heading"
          >
            <VariableFontAndCursor
              fontVariationMapping={resumeTitleFontVariationMapping}
              position={position}
            >
              Résumé
            </VariableFontAndCursor>
          </h2>
        </div>
      </div>

      <div
        aria-hidden={!isContentAccessible}
        className={styles.resumeContentLayer}
        inert={!isContentAccessible ? true : undefined}
      >
        <div className={styles.resumeContent}>
          <h2 id="resume-heading">Résumé</h2>
          <p>
            My experience includes QA automation, diagnostic tooling, and
            testing across software, APIs, firmware, and hardware, alongside
            web and iOS product development.
          </p>
          <nav
            aria-label="Résumé and project links"
            className={styles.resumeLinks}
          >
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
              Open résumé PDF ↗
            </a>
            <a href={resumeUrl} download>
              Download résumé PDF
            </a>
            <a
              href={projectLinks.reindeer}
              target="_blank"
              rel="noopener noreferrer"
            >
              Reindeer Education ↗
            </a>
            <a
              href={projectLinks.bazi}
              target="_blank"
              rel="noopener noreferrer"
            >
              BaZi Atlas on the App Store ↗
            </a>
          </nav>
          <div className={styles.resumeFrame}>
            <object
              aria-label="Current Zeng résumé PDF"
              className={styles.resumeObject}
              data={resumeUrl}
              type="application/pdf"
            >
              <p className={styles.resumeFallback}>
                <a href={resumeUrl}>Open the résumé PDF</a>
              </p>
            </object>
          </div>
        </div>
      </div>
    </section>
  );
}
