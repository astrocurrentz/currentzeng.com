"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createGlitchFrames } from "@/lib/glitch-text";

type GlitchTextProps = {
  accentLettersEnabled?: boolean;
  autoLoop?: boolean;
  className?: string;
  loopIntervalMs?: number;
  loopIntervalOverridesMs?: Record<string, number>;
  scrambleOnMount?: boolean;
  scrambleRevealStep?: number;
  scrambleSignal?: number | string;
  scrambleStepMs?: number;
  tag?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  text?: string;
  texts?: string[];
  wrapToWidth?: boolean;
  wrapToWidthDesktopOnly?: boolean;
};

const glitchGlyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&?!<>";

function normalizeLoopValue(value: string) {
  return value.replace(/-\n/g, "").replace(/\n/g, "");
}

function pickAccentIndex(targetText: string, enabled: boolean) {
  if (!enabled || Math.random() > 0.35) {
    return null;
  }

  const candidates = Array.from(targetText)
    .map((character, index) => (character === "\n" ? -1 : index))
    .filter((index) => index >= 0);

  return candidates[Math.floor(Math.random() * candidates.length)] ?? null;
}

export default function GlitchText({
  accentLettersEnabled = true,
  autoLoop = false,
  className = "",
  loopIntervalMs = 0,
  loopIntervalOverridesMs,
  scrambleOnMount = true,
  scrambleRevealStep = 1 / 3,
  scrambleSignal,
  scrambleStepMs = 30,
  tag: Tag = "span",
  text,
  texts,
}: GlitchTextProps) {
  const sequence = useMemo(
    () => (texts?.length ? texts : text ? [text] : [""]),
    [text, texts],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayText, setDisplayText] = useState(() => sequence[0] ?? "");
  const [accentIndex, setAccentIndex] = useState<number | null>(null);
  const scrambleTimeoutRef = useRef<number | null>(null);
  const loopTimeoutRef = useRef<number | null>(null);
  const previousScrambleSignalRef = useRef<number | string | undefined>(
    undefined,
  );
  const didMountRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (scrambleTimeoutRef.current !== null) {
      window.clearTimeout(scrambleTimeoutRef.current);
      scrambleTimeoutRef.current = null;
    }

    if (loopTimeoutRef.current !== null) {
      window.clearTimeout(loopTimeoutRef.current);
      loopTimeoutRef.current = null;
    }
  }, []);

  const queueNextLoop = useCallback(
    (nextIndex: number) => {
      if (!autoLoop || sequence.length <= 1) {
        return;
      }

      const currentLoopValue = sequence[nextIndex] ?? "";
      const resolvedLoopIntervalMs =
        loopIntervalOverridesMs?.[normalizeLoopValue(currentLoopValue)] ??
        loopIntervalMs;

      loopTimeoutRef.current = window.setTimeout(() => {
        setActiveIndex((current) => (current + 1) % sequence.length);
      }, resolvedLoopIntervalMs);
    },
    [autoLoop, loopIntervalMs, loopIntervalOverridesMs, sequence],
  );

  const startScramble = useCallback(
    (targetText: string, nextIndex: number) => {
      clearTimers();

      const frameCount = Math.max(
        2,
        Math.ceil(targetText.length / Math.max(scrambleRevealStep, 0.1)) + 1,
      );
      const frames = createGlitchFrames({
        frameCount,
        glyphs: glitchGlyphs,
        lines: [targetText],
      });
      let frameIndex = 0;

      const commitFrame = () => {
        if (frameIndex === 0) {
          setAccentIndex(pickAccentIndex(targetText, accentLettersEnabled));
        }

        setDisplayText(frames[frameIndex]?.[0] ?? targetText);

        if (frameIndex >= frames.length - 1) {
          setDisplayText(targetText);
          scrambleTimeoutRef.current = null;
          queueNextLoop(nextIndex);
          return;
        }

        frameIndex += 1;
        scrambleTimeoutRef.current = window.setTimeout(
          commitFrame,
          Math.max(1, scrambleStepMs),
        );
      };

      scrambleTimeoutRef.current = window.setTimeout(commitFrame, 0);
    },
    [
      accentLettersEnabled,
      clearTimers,
      queueNextLoop,
      scrambleRevealStep,
      scrambleStepMs,
    ],
  );

  useEffect(() => {
    const nextIndex = activeIndex % Math.max(sequence.length, 1);
    const nextText = sequence[nextIndex] ?? "";

    if (!didMountRef.current) {
      didMountRef.current = true;

      if (!scrambleOnMount) {
        loopTimeoutRef.current = window.setTimeout(() => {
          setDisplayText(nextText);
          queueNextLoop(nextIndex);
        }, 0);

        return clearTimers;
      }
    }

    startScramble(nextText, nextIndex);

    return clearTimers;
  }, [
    activeIndex,
    clearTimers,
    queueNextLoop,
    scrambleOnMount,
    sequence,
    startScramble,
  ]);

  useEffect(() => {
    if (scrambleSignal === undefined) {
      return;
    }

    if (previousScrambleSignalRef.current === undefined) {
      previousScrambleSignalRef.current = scrambleSignal;
      return;
    }

    if (previousScrambleSignalRef.current === scrambleSignal) {
      return;
    }

    previousScrambleSignalRef.current = scrambleSignal;
    const nextIndex = activeIndex % Math.max(sequence.length, 1);
    startScramble(sequence[nextIndex] ?? "", nextIndex);
  }, [activeIndex, scrambleSignal, sequence, startScramble]);

  return (
    <Tag className={`${className} relative inline-block max-w-full`}>
      {displayText.split("").map((character, index) =>
        character === "\n" ? (
          <br key={`break-${index}`} />
        ) : (
          <span
            className={
              accentLettersEnabled && index === accentIndex
                ? "text-[var(--accent-secondary)]"
                : undefined
            }
            key={`char-${index}`}
          >
            {character}
          </span>
        ),
      )}
    </Tag>
  );
}
