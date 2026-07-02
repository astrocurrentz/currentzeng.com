"use client";

/*
 * Inspired by Fancy Components' Random Letter Swap:
 * https://www.fancycomponents.dev/docs/components/text/random-letter-swap
 */

import { useReducedMotion } from "motion/react";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { cx } from "@/lib/class-names";
import styles from "./random-letter-swap.module.css";

type RandomLetterSwapProps = {
  label: string;
  className?: string;
  isHovered?: boolean;
  playKey?: string | number;
};

type GlyphStyle = CSSProperties & {
  "--random-letter-swap-delay": string;
};

type GlyphToken = {
  animationIndex: number;
  character: string;
  key: string;
};

type WordToken = {
  glyphs: GlyphToken[];
  key: string;
  trailingSpace: string;
};

const loadAnimationMs = 820;
const staggerDurationMs = 35;

function getRandomOrder(length: number) {
  const order = Array.from({ length }, (_, index) => index);

  for (let index = order.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
  }

  return order;
}

function getWordTokens(label: string) {
  const matches = label.match(/\S+\s*/gu) ?? [];
  let animationIndex = 0;

  return matches.map((match, matchIndex): WordToken => {
    const trailingSpaceMatch = match.match(/\s+$/u);
    const trailingSpace = trailingSpaceMatch?.[0] ?? "";
    const word =
      trailingSpace.length === 0
        ? match
        : match.slice(0, -trailingSpace.length);
    const glyphs = Array.from(word).map((character, characterIndex) => {
      const token: GlyphToken = {
        animationIndex,
        character,
        key: `${matchIndex}-${character}-${characterIndex}`,
      };

      animationIndex += 1;

      return token;
    });

    return {
      glyphs,
      key: `${matchIndex}-${word}`,
      trailingSpace,
    };
  });
}

function getAnimatedCharacterCount(wordTokens: WordToken[]) {
  return wordTokens.reduce(
    (count, token) => count + token.glyphs.length,
    0,
  );
}

function getDisplaySpace(space: string) {
  return "\u00a0".repeat(Array.from(space).length);
}

export function RandomLetterSwap({
  className,
  isHovered: controlledIsHovered,
  label,
  playKey,
}: RandomLetterSwapProps) {
  const prefersReducedMotion = useReducedMotion();
  const wordTokens = useMemo(() => getWordTokens(label), [label]);
  const animatedCharacterCount = useMemo(
    () => getAnimatedCharacterCount(wordTokens),
    [wordTokens],
  );
  const [randomOrder, setRandomOrder] = useState(() =>
    getRandomOrder(animatedCharacterCount),
  );
  const [isHovered, setIsHovered] = useState(false);
  const [isLoadAnimating, setIsLoadAnimating] = useState(false);
  const [loadRunKey, setLoadRunKey] = useState(0);

  const refreshRandomOrder = useCallback(() => {
    setRandomOrder(getRandomOrder(animatedCharacterCount));
  }, [animatedCharacterCount]);

  useEffect(() => {
    if (playKey === undefined || prefersReducedMotion) {
      return;
    }

    let timeoutId: number | undefined;
    const frameId = window.requestAnimationFrame(() => {
      refreshRandomOrder();
      setIsLoadAnimating(true);
      setLoadRunKey((currentKey) => currentKey + 1);

      const longestDelay =
        Math.max(0, animatedCharacterCount - 1) * staggerDurationMs;
      timeoutId = window.setTimeout(
        () => setIsLoadAnimating(false),
        loadAnimationMs + longestDelay,
      );
    });

    return () => {
      window.cancelAnimationFrame(frameId);

      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [
    animatedCharacterCount,
    playKey,
    prefersReducedMotion,
    refreshRandomOrder,
  ]);

  useEffect(() => {
    if (controlledIsHovered !== true || prefersReducedMotion) {
      return;
    }

    const frameId = window.requestAnimationFrame(refreshRandomOrder);

    return () => window.cancelAnimationFrame(frameId);
  }, [controlledIsHovered, prefersReducedMotion, refreshRandomOrder]);

  const handlePointerEnter = useCallback(() => {
    if (controlledIsHovered !== undefined || prefersReducedMotion) {
      return;
    }

    refreshRandomOrder();
    setIsHovered(true);
  }, [controlledIsHovered, prefersReducedMotion, refreshRandomOrder]);

  const handlePointerLeave = useCallback(() => {
    if (controlledIsHovered !== undefined) {
      return;
    }

    setIsHovered(false);
  }, [controlledIsHovered]);
  const activeIsHovered = controlledIsHovered ?? isHovered;

  return (
    <span
      aria-hidden="true"
      className={cx(styles.root, className)}
      data-random-letter-swap=""
      data-random-letter-swap-hovered={
        activeIsHovered ? "true" : undefined
      }
      data-random-letter-swap-loading={
        isLoadAnimating ? "true" : undefined
      }
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {wordTokens.map((wordToken) => (
        <span className={styles.word} key={wordToken.key}>
          {wordToken.glyphs.map((glyph) => {
            const style: GlyphStyle = {
              "--random-letter-swap-delay": `${
                (randomOrder[glyph.animationIndex] ??
                  glyph.animationIndex) * staggerDurationMs
              }ms`,
            };

            return (
              <span
                className={styles.glyph}
                key={glyph.key}
                style={style}
              >
                <span
                  className={styles.stack}
                  key={`${loadRunKey}-${glyph.animationIndex}`}
                >
                  <span className={styles.copy}>
                    {glyph.character}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cx(styles.copy, styles.copySecondary)}
                  >
                    {glyph.character}
                  </span>
                </span>
              </span>
            );
          })}
          {wordToken.trailingSpace.length === 0 ? null : (
            <span aria-hidden="true" className={styles.space}>
              {getDisplaySpace(wordToken.trailingSpace)}
            </span>
          )}
        </span>
      ))}
    </span>
  );
}
