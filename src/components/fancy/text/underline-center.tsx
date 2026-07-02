"use client";

/*
 * Adapted from Fancy Components' Underline Center:
 * https://www.fancycomponents.dev/docs/components/text/underline-animation
 */

import type { ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type ValueAnimationTransition,
} from "motion/react";
import { cx } from "@/lib/class-names";

type CenterUnderlineBaseProps = {
  children: ReactNode;
  className?: string;
  transition?: ValueAnimationTransition;
  underlineHeightRatio?: number;
  underlinePaddingRatio?: number;
};

type CenterUnderlineAnchorProps = CenterUnderlineBaseProps &
  Omit<
    HTMLMotionProps<"a">,
    keyof CenterUnderlineBaseProps
  > & {
    as: "a";
  };

type CenterUnderlineButtonProps = CenterUnderlineBaseProps &
  Omit<
    HTMLMotionProps<"button">,
    keyof CenterUnderlineBaseProps
  > & {
    as: "button";
  };

type CenterUnderlineSpanProps = CenterUnderlineBaseProps &
  Omit<HTMLMotionProps<"span">, keyof CenterUnderlineBaseProps> & {
    as?: "span";
  };

export type CenterUnderlineProps =
  | CenterUnderlineAnchorProps
  | CenterUnderlineButtonProps
  | CenterUnderlineSpanProps;

const underlineVariants = {
  active: {
    scaleX: 1,
  },
  idle: {
    scaleX: 0,
  },
};

export function CenterUnderline({
  as = "span",
  children,
  className,
  transition = { duration: 0.25, ease: "easeInOut" },
  underlineHeightRatio = 0.1,
  underlinePaddingRatio = 0.01,
  ...elementProps
}: CenterUnderlineProps) {
  const prefersReducedMotion = useReducedMotion();
  const resolvedTransition = prefersReducedMotion
    ? { duration: 0 }
    : transition;
  const content = (
    <>
      <span className="relative z-1">{children}</span>
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bg-current"
        style={{
          bottom: `${-underlinePaddingRatio}em`,
          height: `${underlineHeightRatio}em`,
          transformOrigin: "center",
        }}
        transition={resolvedTransition}
        variants={underlineVariants}
      />
    </>
  );
  const animatedProps = {
    animate: "idle",
    className: cx("relative inline-block", className),
    initial: "idle",
    whileFocus: "active",
    whileHover: "active",
  } as const;

  if (as === "a") {
    const anchorProps = elementProps as HTMLMotionProps<"a">;

    return (
      <motion.a {...anchorProps} {...animatedProps}>
        {content}
      </motion.a>
    );
  }

  if (as === "button") {
    const buttonProps = elementProps as HTMLMotionProps<"button">;

    return (
      <motion.button type="button" {...buttonProps} {...animatedProps}>
        {content}
      </motion.button>
    );
  }

  const spanProps = elementProps as HTMLMotionProps<"span">;

  return (
    <motion.span {...spanProps} {...animatedProps}>
      {content}
    </motion.span>
  );
}
