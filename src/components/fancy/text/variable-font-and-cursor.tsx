"use client";

/*
 * Inspired by Fancy Components' Variable Font And Cursor:
 * https://www.fancycomponents.dev/docs/components/text/variable-font-and-cursor
 */

import {
  type CSSProperties,
  type RefObject,
  useEffect,
  useMemo,
  useState,
} from "react";
import { cx } from "@/lib/class-names";
import styles from "./variable-font-and-cursor.module.css";

export type FontVariationAxis = {
  max: number;
  min: number;
  name: string;
};

export type FontVariationMapping = {
  x: FontVariationAxis;
  y: FontVariationAxis;
};

export type CursorPosition = {
  x: number;
  y: number;
};

type VariableFontAndCursorProps = {
  children: string;
  className?: string;
  fontVariationMapping: FontVariationMapping;
  position: CursorPosition;
};

const centerPosition = {
  x: 0.5,
  y: 0.5,
} as const satisfies CursorPosition;

function clamp(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function interpolate(axis: FontVariationAxis, progress: number) {
  return axis.min + (axis.max - axis.min) * progress;
}

function getAxisValues(
  fontVariationMapping: FontVariationMapping,
  position: CursorPosition,
) {
  return [
    {
      name: fontVariationMapping.x.name,
      value: interpolate(fontVariationMapping.x, position.x),
    },
    {
      name: fontVariationMapping.y.name,
      value: interpolate(fontVariationMapping.y, position.y),
    },
  ];
}

function getFontVariationSettings(
  fontVariationMapping: FontVariationMapping,
  position: CursorPosition,
) {
  return getAxisValues(fontVariationMapping, position)
    .map(({ name, value }) => `'${name}' ${Math.round(value)}`)
    .join(", ");
}

function getFontWeight(
  fontVariationMapping: FontVariationMapping,
  position: CursorPosition,
) {
  return getAxisValues(fontVariationMapping, position).find(
    ({ name }) => name === "wght",
  )?.value;
}

function getFontStyle(
  fontVariationMapping: FontVariationMapping,
  position: CursorPosition,
): CSSProperties {
  const fontWeight = getFontWeight(fontVariationMapping, position);

  return {
    fontVariationSettings: getFontVariationSettings(
      fontVariationMapping,
      position,
    ),
    fontWeight: fontWeight ? Math.round(fontWeight) : undefined,
  };
}

export function useVariableFontCursor<T extends HTMLElement>(
  containerRef: RefObject<T | null>,
) {
  const [position, setPosition] = useState<CursorPosition>(centerPosition);
  const [isActive, setIsActive] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const finePointerQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    );
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let animationFrame: number | null = null;

    const setCursorPosition = (nextPosition: CursorPosition) => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }

      animationFrame = window.requestAnimationFrame(() => {
        setPosition(nextPosition);
        animationFrame = null;
      });
    };

    const resetPosition = () => {
      setIsActive(false);
      setCursorPosition(centerPosition);
    };

    const handlePointerPosition = (event: PointerEvent) => {
      if (!finePointerQuery.matches || reducedMotionQuery.matches) {
        return;
      }

      const rect = container.getBoundingClientRect();

      if (rect.width === 0 || rect.height === 0) {
        return;
      }

      setIsActive(true);
      setCursorPosition({
        x: clamp((event.clientX - rect.left) / rect.width),
        y: clamp((event.clientY - rect.top) / rect.height),
      });
    };

    const syncCursorCapability = () => {
      const nextIsEnabled =
        finePointerQuery.matches && !reducedMotionQuery.matches;

      setIsEnabled(nextIsEnabled);

      if (!nextIsEnabled) {
        resetPosition();
      }
    };

    syncCursorCapability();
    container.addEventListener("pointerenter", handlePointerPosition);
    container.addEventListener("pointermove", handlePointerPosition);
    container.addEventListener("pointerleave", resetPosition);
    finePointerQuery.addEventListener("change", syncCursorCapability);
    reducedMotionQuery.addEventListener("change", syncCursorCapability);

    return () => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }

      container.removeEventListener("pointerenter", handlePointerPosition);
      container.removeEventListener("pointermove", handlePointerPosition);
      container.removeEventListener("pointerleave", resetPosition);
      finePointerQuery.removeEventListener("change", syncCursorCapability);
      reducedMotionQuery.removeEventListener("change", syncCursorCapability);
    };
  }, [containerRef]);

  return {
    isActive,
    isEnabled,
    position,
  };
}

export function VariableFontAndCursor({
  children,
  className,
  fontVariationMapping,
  position,
}: VariableFontAndCursorProps) {
  const fontStyle = useMemo(
    () => getFontStyle(fontVariationMapping, position),
    [fontVariationMapping, position],
  );

  const sizingGuardStyle = useMemo(
    () => getFontStyle(fontVariationMapping, { x: 1, y: 1 }),
    [fontVariationMapping],
  );

  return (
    <span className={cx(styles.root, className)}>
      <span
        aria-hidden="true"
        className={styles.sizingGuard}
        style={sizingGuardStyle}
      >
        {children}
      </span>
      <span className={styles.text} style={fontStyle}>
        {children}
      </span>
    </span>
  );
}
