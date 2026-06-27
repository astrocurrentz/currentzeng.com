"use client";

import { cx } from "@/lib/class-names";
import styles from "./section-scroll-button.module.css";

export type SectionId = "landing" | "intro" | "area";

type SectionScrollButtonProps = {
  ariaLabel: string;
  direction: "up" | "down";
  placement: "top" | "bottom";
  targetSection: SectionId;
};

export function SectionScrollButton({
  ariaLabel,
  direction,
  placement,
  targetSection,
}: SectionScrollButtonProps) {
  const handleClick = () => {
    const scrollRoot = document.querySelector<HTMLElement>(
      "[data-section-scroll-root]",
    );
    const target = document.querySelector<HTMLElement>(
      `[data-section-id="${targetSection}"]`,
    );

    if (!scrollRoot || !target) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    scrollRoot.scrollTo({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      top: target.offsetTop,
    });
  };

  return (
    <button
      aria-label={ariaLabel}
      className={cx(
        styles.button,
        styles[direction],
        styles[placement],
      )}
      onClick={handleClick}
      type="button"
    >
      <span aria-hidden="true" className={styles.arrow} />
    </button>
  );
}
