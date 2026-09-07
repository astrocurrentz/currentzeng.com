"use client";

/*
 * Inspired by Fancy Components' Variable Font And Cursor:
 * https://www.fancycomponents.dev/docs/components/text/variable-font-and-cursor
 */

import {
  motion,
  type MotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
} from "motion/react";
import {
  type CSSProperties,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
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

type CursorProgress = {
  x: MotionValue<number>;
  y: MotionValue<number>;
};

type VariableFontAndCursorProps = {
  children: string;
  className?: string;
  fontVariationMapping: FontVariationMapping;
  position: CursorProgress;
};

const centerProgress = 0.5;
const cursorSpring = {
  damping: 30,
  mass: 0.3,
  stiffness: 700,
} as const;

type ContainerBounds = {
  height: number;
  left: number;
  top: number;
  width: number;
};

type PointerCoordinates = {
  clientX: number;
  clientY: number;
};

function clamp(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function interpolate(axis: FontVariationAxis, progress: number) {
  return axis.min + (axis.max - axis.min) * progress;
}

function getSizingGuardStyle(
  fontVariationMapping: FontVariationMapping,
): CSSProperties {
  const { x, y } = fontVariationMapping;

  return {
    fontVariationSettings: `'${x.name}' ${x.max}, '${y.name}' ${y.max}`,
  };
}

export function useVariableFontCursor<T extends HTMLElement>(
  containerRef: RefObject<T | null>,
) {
  const progressX = useSpring(centerProgress, cursorSpring);
  const progressY = useSpring(centerProgress, cursorSpring);
  const cursorX = useSpring(0, cursorSpring);
  const cursorY = useSpring(0, cursorSpring);
  const [isActive, setIsActive] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const isActiveRef = useRef(false);
  const isEnabledRef = useRef(false);

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
    let bounds: ContainerBounds | null = null;
    let hasMeasured = false;
    let lastPointer: PointerCoordinates | null = null;

    const setActive = (nextIsActive: boolean) => {
      if (isActiveRef.current === nextIsActive) {
        return;
      }

      isActiveRef.current = nextIsActive;
      setIsActive(nextIsActive);
    };

    const setPositionFromPointer = ({
      clientX,
      clientY,
    }: PointerCoordinates) => {
      if (!bounds || bounds.width === 0 || bounds.height === 0) {
        return;
      }

      const x = clamp((clientX - bounds.left) / bounds.width);
      const y = clamp((clientY - bounds.top) / bounds.height);

      progressX.set(x);
      progressY.set(y);
      cursorX.set(x * bounds.width);
      cursorY.set(y * bounds.height);
    };

    const centerCursor = (immediate = false) => {
      const centerX = (bounds?.width ?? 0) * centerProgress;
      const centerY = (bounds?.height ?? 0) * centerProgress;

      progressX.set(centerProgress);
      progressY.set(centerProgress);
      cursorX.set(centerX);
      cursorY.set(centerY);

      if (immediate) {
        progressX.jump(centerProgress);
        progressY.jump(centerProgress);
        cursorX.jump(centerX);
        cursorY.jump(centerY);
      }
    };

    const measureContainer = () => {
      const rect = container.getBoundingClientRect();

      bounds = {
        height: rect.height,
        left: rect.left,
        top: rect.top,
        width: rect.width,
      };

      if (!hasMeasured) {
        hasMeasured = true;
        centerCursor(true);
      } else if (isActiveRef.current && lastPointer) {
        setPositionFromPointer(lastPointer);
      } else {
        centerCursor();
      }
    };

    const resetPosition = (immediate = false) => {
      lastPointer = null;
      setActive(false);
      centerCursor(immediate);
    };

    const handlePointerPosition = (event: PointerEvent) => {
      if (!isEnabledRef.current) {
        return;
      }

      lastPointer = {
        clientX: event.clientX,
        clientY: event.clientY,
      };
      setActive(true);
      setPositionFromPointer(lastPointer);
    };

    const handlePointerEnter = (event: PointerEvent) => {
      measureContainer();
      handlePointerPosition(event);
    };

    const handlePointerLeave = () => {
      resetPosition();
    };

    const syncCursorCapability = () => {
      const nextIsEnabled =
        finePointerQuery.matches && !reducedMotionQuery.matches;

      if (isEnabledRef.current !== nextIsEnabled) {
        isEnabledRef.current = nextIsEnabled;
        setIsEnabled(nextIsEnabled);
      }

      if (!nextIsEnabled) {
        resetPosition(true);
      }
    };

    measureContainer();
    syncCursorCapability();
    const resizeObserver = new ResizeObserver(measureContainer);
    resizeObserver.observe(container);
    container.addEventListener("pointerenter", handlePointerEnter);
    container.addEventListener("pointermove", handlePointerPosition, {
      passive: true,
    });
    container.addEventListener("pointerleave", handlePointerLeave);
    finePointerQuery.addEventListener("change", syncCursorCapability);
    reducedMotionQuery.addEventListener("change", syncCursorCapability);

    return () => {
      resizeObserver.disconnect();
      container.removeEventListener("pointerenter", handlePointerEnter);
      container.removeEventListener("pointermove", handlePointerPosition);
      container.removeEventListener("pointerleave", handlePointerLeave);
      finePointerQuery.removeEventListener("change", syncCursorCapability);
      reducedMotionQuery.removeEventListener("change", syncCursorCapability);
    };
  }, [
    containerRef,
    cursorX,
    cursorY,
    progressX,
    progressY,
  ]);

  return {
    cursorX,
    cursorY,
    isActive,
    isEnabled,
    position: {
      x: progressX,
      y: progressY,
    },
  };
}

export function VariableFontAndCursor({
  children,
  className,
  fontVariationMapping,
  position,
}: VariableFontAndCursorProps) {
  const xAxis = useTransform(position.x, (value) =>
    interpolate(fontVariationMapping.x, value),
  );
  const yAxis = useTransform(position.y, (value) =>
    interpolate(fontVariationMapping.y, value),
  );
  const fontVariationSettings = useMotionTemplate`'${fontVariationMapping.x.name}' ${xAxis}, '${fontVariationMapping.y.name}' ${yAxis}`;
  const sizingGuardStyle = useMemo(
    () => getSizingGuardStyle(fontVariationMapping),
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
      <motion.span
        className={styles.text}
        data-variable-font-text
        style={{ fontVariationSettings }}
      >
        {children}
      </motion.span>
    </span>
  );
}
