"use client";

/*
 * Adapted from Fancy Components' Box Carousel:
 * https://www.fancycomponents.dev/r/box-carousel.json
 * Distributed under the MIT license included beside this file.
 */

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type ValueAnimationTransition,
} from "motion/react";
import {
  forwardRef,
  memo,
  type CSSProperties,
  type HTMLProps,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { cx } from "@/lib/class-names";
import styles from "./box-carousel.module.css";

export type CarouselItem = {
  id: string;
  type: "image" | "video";
  src: string;
  alt?: string;
  poster?: string;
};

type FaceProps = {
  transform: string;
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
  debug?: boolean;
};

const CubeFace = memo(function CubeFace({
  children,
  className,
  debug,
  style,
  transform,
}: FaceProps) {
  return (
    <div
      className={cx(styles.face, debug && styles.debugFace, className)}
      style={{ transform, ...style }}
    >
      {children}
    </div>
  );
});

const MediaRenderer = memo(function MediaRenderer({
  className,
  debug = false,
  item,
}: {
  item: CarouselItem | undefined;
  className?: string;
  debug?: boolean;
}) {
  if (item === undefined) {
    return null;
  }

  if (debug) {
    return (
      <div className={cx(styles.debugMedia, className)}>
        {item.id}
      </div>
    );
  }

  if (item.type === "video") {
    return (
      <video
        autoPlay
        className={cx(styles.media, className)}
        loop
        muted
        playsInline
        poster={item.poster}
        src={item.src}
      />
    );
  }

  return (
    // The raw element is required because each image is transformed as a 3D face.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={item.alt ?? ""}
      className={cx(styles.media, className)}
      draggable={false}
      src={item.src}
    />
  );
});

export type BoxCarouselRef = {
  next: () => void;
  prev: () => void;
  getCurrentItemIndex: () => number;
};

export type RotationDirection = "top" | "bottom" | "left" | "right";

export type SpringConfig = {
  stiffness?: number;
  damping?: number;
  mass?: number;
};

type BoxCarouselProps = HTMLProps<HTMLDivElement> & {
  items: CarouselItem[];
  width: number;
  height: number;
  debug?: boolean;
  perspective?: number;
  direction?: RotationDirection;
  transition?: ValueAnimationTransition<number>;
  snapTransition?: ValueAnimationTransition<number>;
  dragSpring?: SpringConfig;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  onIndexChange?: (index: number) => void;
  enableDrag?: boolean;
  dragSensitivity?: number;
};

const defaultTransition: ValueAnimationTransition<number> = {
  duration: 1.25,
  ease: [0.953, 0.001, 0.019, 0.995],
};
const defaultSnapTransition: ValueAnimationTransition<number> = {
  type: "spring",
  damping: 30,
  stiffness: 200,
};
const defaultDragSpring: SpringConfig = {
  stiffness: 200,
  damping: 30,
};
const instantTransition: ValueAnimationTransition<number> = { duration: 0 };

function getNextRotationStep(direction: RotationDirection) {
  return direction === "top" || direction === "right" ? 1 : -1;
}

function getDragRotationStep(direction: RotationDirection) {
  return direction === "top" || direction === "right" ? -1 : 1;
}

const BoxCarousel = forwardRef<BoxCarouselRef, BoxCarouselProps>(
  function BoxCarousel(
    {
      autoPlay = false,
      autoPlayInterval = 3000,
      className,
      debug = false,
      direction = "left",
      dragSensitivity = 0.5,
      dragSpring = defaultDragSpring,
      enableDrag = true,
      height,
      items,
      onIndexChange,
      perspective = 600,
      snapTransition = defaultSnapTransition,
      transition = defaultTransition,
      width,
      ...props
    },
    ref,
  ) {
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [currentFrontFaceIndex, setCurrentFrontFaceIndex] = useState(1);
    const [prevIndex, setPrevIndex] = useState(items.length - 1);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [nextIndex, setNextIndex] = useState(1);
    const [afterNextIndex, setAfterNextIndex] = useState(2);
    const [currentRotation, setCurrentRotation] = useState(0);
    const prefersReducedMotion = useReducedMotion();
    const instructionsId = useId();
    const rotationCount = useRef(1);
    const isRotating = useRef(false);
    const pendingIndexChange = useRef<number | null>(null);
    const isDragging = useRef(false);
    const startPosition = useRef({ x: 0, y: 0 });
    const startRotation = useRef(0);
    const baseRotateX = useMotionValue(0);
    const baseRotateY = useMotionValue(0);
    const springRotateX = useSpring(baseRotateX, dragSpring);
    const springRotateY = useSpring(baseRotateY, dragSpring);
    const effectiveTransition = prefersReducedMotion
      ? instantTransition
      : transition;
    const effectiveSnapTransition = prefersReducedMotion
      ? instantTransition
      : snapTransition;

    const handleAnimationComplete = useCallback(
      (triggeredBy: "next" | "prev") => {
        const pendingIndex = pendingIndexChange.current;

        if (!isRotating.current || pendingIndex === null) {
          return;
        }

        isRotating.current = false;

        const newFrontFaceIndex =
          triggeredBy === "next"
            ? (currentFrontFaceIndex + 1) % 4
            : (currentFrontFaceIndex - 1 + 4) % 4;
        const currentBackFaceIndex =
          triggeredBy === "next"
            ? (newFrontFaceIndex + 2) % 4
            : (newFrontFaceIndex + 3) % 4;
        const indexOffset = triggeredBy === "next" ? 2 : -1;
        const replacementIndex =
          (pendingIndex + indexOffset + items.length) % items.length;

        setCurrentItemIndex(pendingIndex);
        onIndexChange?.(pendingIndex);

        if (currentBackFaceIndex === 0) {
          setPrevIndex(replacementIndex);
        } else if (currentBackFaceIndex === 1) {
          setCurrentIndex(replacementIndex);
        } else if (currentBackFaceIndex === 2) {
          setNextIndex(replacementIndex);
        } else {
          setAfterNextIndex(replacementIndex);
        }

        pendingIndexChange.current = null;
        rotationCount.current += 1;
        setCurrentFrontFaceIndex(newFrontFaceIndex);
      },
      [currentFrontFaceIndex, items.length, onIndexChange],
    );

    const finishRotation = useCallback(
      (rotation: number, directionToFinish: "next" | "prev") => {
        handleAnimationComplete(directionToFinish);
        setCurrentRotation(rotation);
      },
      [handleAnimationComplete],
    );

    const handleDragStart = useCallback(
      (event: React.MouseEvent | React.TouchEvent) => {
        if (!enableDrag || isRotating.current) {
          return;
        }

        const point =
          "touches" in event ? event.touches.item(0) : event;

        if (point === null) {
          return;
        }

        isDragging.current = true;
        startPosition.current = {
          x: point.clientX,
          y: point.clientY,
        };
        startRotation.current = currentRotation;
        event.preventDefault();
      },
      [currentRotation, enableDrag],
    );

    const handleDragMove = useCallback(
      (event: MouseEvent | TouchEvent) => {
        if (!isDragging.current || isRotating.current) {
          return;
        }

        const point =
          "touches" in event ? event.touches.item(0) : event;

        if (point === null) {
          return;
        }

        const isVertical = direction === "top" || direction === "bottom";
        const delta = isVertical
          ? point.clientY - startPosition.current.y
          : point.clientX - startPosition.current.x;
        const rotationDelta = (delta * dragSensitivity) / 2;
        const directionalRotation =
          rotationDelta * getDragRotationStep(direction);
        const nextRotation = Math.max(
          startRotation.current - 120,
          Math.min(
            startRotation.current + 120,
            startRotation.current + directionalRotation,
          ),
        );

        if (isVertical) {
          baseRotateX.set(nextRotation);
        } else {
          baseRotateY.set(nextRotation);
        }
      },
      [baseRotateX, baseRotateY, direction, dragSensitivity],
    );

    const handleDragEnd = useCallback(() => {
      if (!isDragging.current) {
        return;
      }

      isDragging.current = false;

      const isVertical = direction === "top" || direction === "bottom";
      const targetMotionValue = isVertical ? baseRotateX : baseRotateY;
      const snappedRotation = Math.round(targetMotionValue.get() / 90) * 90;
      const steps = Math.round(
        (snappedRotation - currentRotation) / 90,
      );

      if (steps === 0) {
        animate(
          targetMotionValue,
          currentRotation,
          effectiveSnapTransition,
        );
        return;
      }

      isRotating.current = true;

      let pendingIndex = currentItemIndex;
      const nextRotationStep = getNextRotationStep(direction);
      const directionToFinish =
        steps * nextRotationStep > 0 ? "next" : "prev";

      for (let index = 0; index < Math.abs(steps); index += 1) {
        pendingIndex =
          directionToFinish === "next"
            ? (pendingIndex + 1) % items.length
            : (pendingIndex - 1 + items.length) % items.length;
      }

      pendingIndexChange.current = pendingIndex;

      animate(targetMotionValue, snappedRotation, {
        ...effectiveSnapTransition,
        onComplete: () =>
          finishRotation(
            snappedRotation,
            directionToFinish,
          ),
      });
    }, [
      baseRotateX,
      baseRotateY,
      currentItemIndex,
      currentRotation,
      direction,
      effectiveSnapTransition,
      finishRotation,
      items.length,
    ]);

    useEffect(() => {
      if (!enableDrag) {
        return;
      }

      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchmove", handleDragMove);
      window.addEventListener("touchend", handleDragEnd);

      return () => {
        window.removeEventListener("mousemove", handleDragMove);
        window.removeEventListener("mouseup", handleDragEnd);
        window.removeEventListener("touchmove", handleDragMove);
        window.removeEventListener("touchend", handleDragEnd);
      };
    }, [enableDrag, handleDragEnd, handleDragMove]);

    const next = useCallback(() => {
      if (items.length === 0 || isRotating.current) {
        return;
      }

      isRotating.current = true;
      pendingIndexChange.current =
        (currentItemIndex + 1) % items.length;

      const isVertical = direction === "top" || direction === "bottom";
      const targetMotionValue = isVertical ? baseRotateX : baseRotateY;
      const rotationDelta = getNextRotationStep(direction) * 90;
      const targetRotation = currentRotation + rotationDelta;

      animate(targetMotionValue, targetRotation, {
        ...effectiveTransition,
        onComplete: () => finishRotation(targetRotation, "next"),
      });
    }, [
      baseRotateX,
      baseRotateY,
      currentItemIndex,
      currentRotation,
      direction,
      effectiveTransition,
      finishRotation,
      items.length,
    ]);

    const prev = useCallback(() => {
      if (items.length === 0 || isRotating.current) {
        return;
      }

      isRotating.current = true;
      pendingIndexChange.current =
        (currentItemIndex - 1 + items.length) % items.length;

      const isVertical = direction === "top" || direction === "bottom";
      const targetMotionValue = isVertical ? baseRotateX : baseRotateY;
      const rotationDelta = getNextRotationStep(direction) * -90;
      const targetRotation = currentRotation + rotationDelta;

      animate(targetMotionValue, targetRotation, {
        ...effectiveTransition,
        onComplete: () => finishRotation(targetRotation, "prev"),
      });
    }, [
      baseRotateX,
      baseRotateY,
      currentItemIndex,
      currentRotation,
      direction,
      effectiveTransition,
      finishRotation,
      items.length,
    ]);

    useImperativeHandle(
      ref,
      () => ({
        getCurrentItemIndex: () => currentItemIndex,
        next,
        prev,
      }),
      [currentItemIndex, next, prev],
    );

    const depth = useMemo(
      () =>
        direction === "top" || direction === "bottom"
          ? height
          : width,
      [direction, height, width],
    );
    const transform = useTransform(
      isDragging.current
        ? [springRotateX, springRotateY]
        : [baseRotateX, baseRotateY],
      ([x, y]) =>
        `translateZ(-${depth / 2}px) rotateX(${x}deg) rotateY(${y}deg)`,
    );
    const faceTransforms = useMemo(() => {
      if (direction === "top") {
        return [
          `rotateX(90deg) translateZ(${height / 2}px)`,
          `rotateY(0deg) translateZ(${depth / 2}px)`,
          `rotateX(-90deg) translateZ(${height / 2}px)`,
          `rotateY(180deg) translateZ(${depth / 2}px) rotateZ(180deg)`,
        ];
      }

      if (direction === "right") {
        return [
          `rotateY(90deg) translateZ(${width / 2}px)`,
          `rotateY(0deg) translateZ(${depth / 2}px)`,
          `rotateY(-90deg) translateZ(${width / 2}px)`,
          `rotateY(180deg) translateZ(${depth / 2}px)`,
        ];
      }

      if (direction === "bottom") {
        return [
          `rotateX(-90deg) translateZ(${height / 2}px)`,
          `rotateY(0deg) translateZ(${depth / 2}px)`,
          `rotateX(90deg) translateZ(${height / 2}px)`,
          `rotateY(180deg) translateZ(${depth / 2}px) rotateZ(180deg)`,
        ];
      }

      return [
        `rotateY(-90deg) translateZ(${width / 2}px)`,
        `rotateY(0deg) translateZ(${depth / 2}px)`,
        `rotateY(90deg) translateZ(${width / 2}px)`,
        `rotateY(180deg) translateZ(${depth / 2}px)`,
      ];
    }, [depth, direction, height, width]);

    useEffect(() => {
      if (!autoPlay || items.length === 0) {
        return;
      }

      const interval = window.setInterval(next, autoPlayInterval);

      return () => window.clearInterval(interval);
    }, [autoPlay, autoPlayInterval, items.length, next]);

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (isRotating.current) {
          return;
        }

        if (
          event.key === "ArrowLeft" &&
          (direction === "left" || direction === "right")
        ) {
          event.preventDefault();
          prev();
        } else if (
          event.key === "ArrowRight" &&
          (direction === "left" || direction === "right")
        ) {
          event.preventDefault();
          next();
        } else if (
          event.key === "ArrowUp" &&
          (direction === "top" || direction === "bottom")
        ) {
          event.preventDefault();
          prev();
        } else if (
          event.key === "ArrowDown" &&
          (direction === "top" || direction === "bottom")
        ) {
          event.preventDefault();
          next();
        }
      },
      [direction, next, prev],
    );

    const faceItems = [
      items[prevIndex],
      items[currentIndex],
      items[nextIndex],
      items[afterNextIndex],
    ];
    const debugColors = ["#ff9999", "#99ff99", "#9999ff", "#ffff99"];

    return (
      <div
        aria-atomic="true"
        aria-describedby={instructionsId}
        aria-label={`3D carousel with ${items.length} items`}
        aria-live="polite"
        className={cx(
          styles.container,
          enableDrag && styles.draggable,
          className,
        )}
        onKeyDown={handleKeyDown}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={{ height, perspective: `${perspective}px`, width }}
        tabIndex={0}
        {...props}
      >
        <span className={styles.visuallyHidden} id={instructionsId}>
          Use the left and right arrow keys, or drag, to change images.
        </span>
        <div
          aria-live="assertive"
          className={styles.visuallyHidden}
        >
          Showing item {currentItemIndex + 1} of {items.length}:{" "}
          {items[currentItemIndex]?.alt ??
            `Item ${currentItemIndex + 1}`}
        </div>
        <motion.div
          className={styles.cube}
          style={{ transform }}
        >
          {faceTransforms.map((faceTransform, index) => (
            <CubeFace
              debug={debug}
              key={index}
              style={{
                backgroundColor: debug
                  ? debugColors[index]
                  : undefined,
                height,
                width,
              }}
              transform={faceTransform}
            >
              <MediaRenderer
                debug={debug}
                item={faceItems[index]}
              />
            </CubeFace>
          ))}
        </motion.div>
      </div>
    );
  },
);

BoxCarousel.displayName = "BoxCarousel";

export default BoxCarousel;
