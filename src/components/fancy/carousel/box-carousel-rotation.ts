import {
  animate,
  type MotionValue,
} from "motion/react";

export type RotationDirection = "top" | "bottom" | "left" | "right";

export function getNextRotationStep(direction: RotationDirection) {
  return direction === "top" || direction === "right" ? 1 : -1;
}

export function getDragRotationStep(direction: RotationDirection) {
  return direction === "top" || direction === "right" ? -1 : 1;
}

export function runCarouselAttentionHint({
  currentRotation,
  direction,
  targetMotionValue,
}: {
  currentRotation: number;
  direction: RotationDirection;
  targetMotionValue: MotionValue<number>;
}) {
  const hintRotation =
    currentRotation + getDragRotationStep(direction) * 8;
  let restoreAnimation:
    | ReturnType<typeof animate>
    | undefined;
  const hintAnimation = animate(targetMotionValue, hintRotation, {
    type: "spring",
    damping: 15,
    stiffness: 220,
    onComplete: () => {
      restoreAnimation = animate(targetMotionValue, currentRotation, {
        type: "spring",
        damping: 18,
        stiffness: 240,
      });
    },
  });

  return () => {
    hintAnimation.stop();
    restoreAnimation?.stop();
    targetMotionValue.set(currentRotation);
  };
}
