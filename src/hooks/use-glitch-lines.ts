"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  createGlitchFrames,
  createScrambleFrames,
} from "@/lib/glitch-text";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(reducedMotionQuery);
  mediaQuery.addEventListener("change", onStoreChange);

  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(reducedMotionQuery).matches;
}

function getServerReducedMotionSnapshot() {
  return false;
}

type UseGlitchLinesOptions = {
  active?: boolean;
  durationMs: number;
  frameCount: number;
  glyphs: string;
  handsetDurationMs?: number;
  handsetStartDelayMs?: number;
  lines: readonly string[];
  scrambleIntervalMs?: number;
  sequenceGapMs?: number;
  startDelayMs?: number;
};

export function useGlitchLines({
  active = true,
  durationMs,
  frameCount,
  glyphs,
  handsetDurationMs = durationMs,
  handsetStartDelayMs = 0,
  lines,
  scrambleIntervalMs = 55,
  sequenceGapMs = 0,
  startDelayMs = 0,
}: UseGlitchLinesOptions) {
  const finalLines = useMemo(() => [...lines], [lines]);
  const glitchFrames = useMemo(
    () => createGlitchFrames({ frameCount, glyphs, lines: finalLines }),
    [finalLines, frameCount, glyphs],
  );
  const scrambleFrames = useMemo(
    () => createScrambleFrames({ frameCount, glyphs, lines: finalLines }),
    [finalLines, frameCount, glyphs],
  );
  const initialScrambleLines = useMemo(
    () => scrambleFrames[0] ?? finalLines,
    [finalLines, scrambleFrames],
  );
  const [animatedLines, setAnimatedLines] =
    useState<readonly string[]>(initialScrambleLines);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot,
  );

  useEffect(() => {
    if (finalLines.length === 0 || prefersReducedMotion) {
      return;
    }

    let animationFrame = 0;
    let cancelled = false;
    let delayTimer: number | undefined;
    let fontTimeout: number | undefined;
    let lastFrameKey = "scramble:0";
    let scrambleStartedAt: number | undefined;
    let sequenceReady = false;
    let sequenceScheduled = false;
    let sequenceStartedAt: number | undefined;
    const isHandset = window.matchMedia(
      "(pointer: coarse), (max-width: 640px)",
    ).matches;
    const activeDurationMs = Math.max(
      1,
      isHandset ? handsetDurationMs : durationMs,
    );
    const activeStartDelayMs = isHandset
      ? handsetStartDelayMs
      : startDelayMs;
    const activeScrambleIntervalMs = Math.max(1, scrambleIntervalMs);
    const activeSequenceGapMs = Math.max(0, sequenceGapMs);

    const commitFrame = (frameKey: string, lines: readonly string[]) => {
      if (frameKey === lastFrameKey) {
        return;
      }

      lastFrameKey = frameKey;
      setAnimatedLines(lines);
    };

    const renderFrame = (timestamp: number) => {
      if (cancelled) {
        return;
      }

      scrambleStartedAt ??= timestamp;
      const scrambleFrameIndex =
        Math.floor(
          (timestamp - scrambleStartedAt) / activeScrambleIntervalMs,
        ) % scrambleFrames.length;
      const activeScrambleLines =
        scrambleFrames[scrambleFrameIndex] ?? initialScrambleLines;

      if (!sequenceReady) {
        commitFrame(`scramble:${scrambleFrameIndex}`, activeScrambleLines);
        animationFrame = window.requestAnimationFrame(renderFrame);
        return;
      }

      sequenceStartedAt ??= timestamp;
      const elapsedMs = timestamp - sequenceStartedAt;
      const sequenceStepMs = activeDurationMs + activeSequenceGapMs;
      const totalDurationMs =
        finalLines.length * activeDurationMs +
        (finalLines.length - 1) * activeSequenceGapMs;

      if (elapsedMs >= totalDurationMs) {
        setAnimatedLines(finalLines);
        return;
      }

      const activeLineIndex = Math.min(
        finalLines.length - 1,
        Math.floor(elapsedMs / sequenceStepMs),
      );
      const activeLineElapsedMs =
        elapsedMs - activeLineIndex * sequenceStepMs;
      const nextLines = [...activeScrambleLines];

      for (let lineIndex = 0; lineIndex < activeLineIndex; lineIndex += 1) {
        nextLines[lineIndex] = finalLines[lineIndex];
      }

      let activeFrameKey = "gap";

      if (activeLineElapsedMs < activeDurationMs) {
        const progress = activeLineElapsedMs / activeDurationMs;
        const frameIndex = Math.min(
          glitchFrames.length - 1,
          Math.floor(progress * (glitchFrames.length - 1)),
        );
        nextLines[activeLineIndex] =
          glitchFrames[frameIndex]?.[activeLineIndex] ??
          finalLines[activeLineIndex];
        activeFrameKey = `reveal:${frameIndex}`;
      } else {
        nextLines[activeLineIndex] = finalLines[activeLineIndex];
      }

      commitFrame(
        `sequence:${activeLineIndex}:${activeFrameKey}:scramble:${scrambleFrameIndex}`,
        nextLines,
      );
      animationFrame = window.requestAnimationFrame(renderFrame);
    };

    animationFrame = window.requestAnimationFrame(renderFrame);

    const scheduleSequence = () => {
      if (!active || sequenceScheduled || cancelled) {
        return;
      }

      sequenceScheduled = true;
      delayTimer = window.setTimeout(() => {
        sequenceReady = true;
      }, activeStartDelayMs);
    };

    if (active && "fonts" in document) {
      fontTimeout = window.setTimeout(scheduleSequence, 800);
      void document.fonts.ready.then(() => {
        if (fontTimeout) {
          window.clearTimeout(fontTimeout);
          fontTimeout = undefined;
        }

        scheduleSequence();
      });
    } else if (active) {
      scheduleSequence();
    }

    return () => {
      cancelled = true;

      if (delayTimer) {
        window.clearTimeout(delayTimer);
      }

      if (fontTimeout) {
        window.clearTimeout(fontTimeout);
      }

      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [
    active,
    durationMs,
    finalLines,
    glitchFrames,
    handsetDurationMs,
    handsetStartDelayMs,
    initialScrambleLines,
    prefersReducedMotion,
    scrambleFrames,
    scrambleIntervalMs,
    sequenceGapMs,
    startDelayMs,
  ]);

  return prefersReducedMotion ? finalLines : animatedLines;
}
