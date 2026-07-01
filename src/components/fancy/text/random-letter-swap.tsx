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

const loadAnimationMs = 820;
const staggerDurationMs = 35;

function getCharacters(label: string) {
  return Array.from(label);
}

function getRandomOrder(length: number) {
  const order = Array.from({ length }, (_, index) => index);

  for (let index = order.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
  }

  return order;
}

function getDisplayCharacter(character: string) {
  return character === " " ? "\u00a0" : character;
}

export function RandomLetterSwap({
  className,
  isHovered: controlledIsHovered,
  label,
  playKey,
}: RandomLetterSwapProps) {
  const prefersReducedMotion = useReducedMotion();
  const characters = useMemo(() => getCharacters(label), [label]);
  const [randomOrder, setRandomOrder] = useState(() =>
    getRandomOrder(characters.length),
  );
  const [isHovered, setIsHovered] = useState(false);
  const [isLoadAnimating, setIsLoadAnimating] = useState(false);
  const [loadRunKey, setLoadRunKey] = useState(0);

  const refreshRandomOrder = useCallback(() => {
    setRandomOrder(getRandomOrder(characters.length));
  }, [characters.length]);

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
        Math.max(0, characters.length - 1) * staggerDurationMs;
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
    characters.length,
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
      {characters.map((character, index) => {
        const displayCharacter = getDisplayCharacter(character);
        const style: GlyphStyle = {
          "--random-letter-swap-delay": `${
            (randomOrder[index] ?? index) * staggerDurationMs
          }ms`,
        };

        return (
          <span
            className={styles.glyph}
            key={`${character}-${index}`}
            style={style}
          >
            <span
              className={styles.stack}
              key={`${loadRunKey}-${index}`}
            >
              <span className={styles.copy}>{displayCharacter}</span>
              <span
                aria-hidden="true"
                className={cx(styles.copy, styles.copySecondary)}
              >
                {displayCharacter}
              </span>
            </span>
          </span>
        );
      })}
    </span>
  );
}
