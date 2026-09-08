"use client";

import { Afacad_Flux } from "next/font/google";
import { motion } from "motion/react";
import {
  type PointerEvent as ReactPointerEvent,
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

const pointerMovementTarget = 3;
const revealFallbackDelayMs = 2500;
const revealTransitionDurationMs = 400;

type ResumeRevealState = "hero" | "transitioning" | "content";

type PointerCoordinates = {
  x: number;
  y: number;
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ResumeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackingRef = useRef<HTMLDivElement>(null);
  const revealStateRef = useRef<ResumeRevealState>("hero");
  const movementCountRef = useRef(0);
  const queuedPointerRef = useRef<PointerCoordinates | null>(null);
  const lastPointerRef = useRef<PointerCoordinates | null>(null);
  const movementFrameRef = useRef<number | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const isInResumeBandRef = useRef(false);
  const [revealState, setRevealState] =
    useState<ResumeRevealState>("hero");
  const { cursorX, cursorY, isActive, isEnabled, position } =
    useVariableFontCursor(trackingRef);

  const updateRevealState = useCallback((nextState: ResumeRevealState) => {
    revealStateRef.current = nextState;
    setRevealState(nextState);
  }, []);

  const clearFallbackTimer = useCallback(() => {
    if (fallbackTimerRef.current === null) {
      return;
    }

    window.clearTimeout(fallbackTimerRef.current);
    fallbackTimerRef.current = null;
  }, []);

  const clearTransitionTimer = useCallback(() => {
    if (transitionTimerRef.current === null) {
      return;
    }

    window.clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = null;
  }, []);

  const clearMovementFrame = useCallback(() => {
    if (movementFrameRef.current === null) {
      return;
    }

    window.cancelAnimationFrame(movementFrameRef.current);
    movementFrameRef.current = null;
  }, []);

  const beginReveal = useCallback(() => {
    if (revealStateRef.current !== "hero") {
      return;
    }

    clearFallbackTimer();
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
  }, [clearFallbackTimer, clearTransitionTimer, updateRevealState]);

  const scheduleFallbackReveal = useCallback(() => {
    clearFallbackTimer();
    fallbackTimerRef.current = window.setTimeout(() => {
      fallbackTimerRef.current = null;
      beginReveal();
    }, revealFallbackDelayMs);
  }, [beginReveal, clearFallbackTimer]);

  const resetForEntry = useCallback(() => {
    clearFallbackTimer();
    clearTransitionTimer();
    clearMovementFrame();
    movementCountRef.current = 0;
    queuedPointerRef.current = null;
    lastPointerRef.current = null;
    updateRevealState("hero");
    scheduleFallbackReveal();
  }, [
    clearFallbackTimer,
    clearMovementFrame,
    clearTransitionTimer,
    scheduleFallbackReveal,
    updateRevealState,
  ]);

  useEffect(() => {
    const section = sectionRef.current;
    const scrollRoot = document.querySelector<HTMLElement>(
      "[data-section-scroll-root]",
    );

    if (!section || !scrollRoot) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isInResumeBandRef.current) {
          isInResumeBandRef.current = true;
          section.dataset.resumeEntryActive = "true";
          resetForEntry();
          return;
        }

        if (!entry.isIntersecting && isInResumeBandRef.current) {
          isInResumeBandRef.current = false;
          delete section.dataset.resumeEntryActive;
          clearFallbackTimer();
          clearTransitionTimer();
          clearMovementFrame();
        }
      },
      {
        root: scrollRoot,
        rootMargin: "0px 0px -75% 0px",
        threshold: 0,
      },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      delete section.dataset.resumeEntryActive;
      isInResumeBandRef.current = false;
      clearFallbackTimer();
      clearTransitionTimer();
      clearMovementFrame();
    };
  }, [
    clearFallbackTimer,
    clearMovementFrame,
    clearTransitionTimer,
    resetForEntry,
  ]);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isEnabled || revealStateRef.current !== "hero") {
      return;
    }

    queuedPointerRef.current = {
      x: event.clientX,
      y: event.clientY,
    };

    if (movementFrameRef.current !== null) {
      return;
    }

    movementFrameRef.current = window.requestAnimationFrame(() => {
      movementFrameRef.current = null;
      const nextPointer = queuedPointerRef.current;
      const previousPointer = lastPointerRef.current;

      if (
        !nextPointer ||
        (previousPointer?.x === nextPointer.x &&
          previousPointer.y === nextPointer.y)
      ) {
        return;
      }

      lastPointerRef.current = nextPointer;
      movementCountRef.current += 1;
      scheduleFallbackReveal();

      if (movementCountRef.current >= pointerMovementTarget) {
        beginReveal();
      }
    });
  };

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
          onPointerMove={handlePointerMove}
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
