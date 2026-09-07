"use client";

import { Afacad_Flux } from "next/font/google";
import { motion } from "motion/react";
import { useRef } from "react";
import { SectionScrollButton } from "@/components/section-scroll-button";
import {
  type FontVariationMapping,
  useVariableFontCursor,
  VariableFontAndCursor,
} from "@/components/fancy/text/variable-font-and-cursor";
import { designTokens } from "@/config/design-tokens";
import { cx } from "@/lib/class-names";
import { defineCssVars } from "@/lib/css-vars";
import styles from "./resume-sections.module.css";

const resumeTitleFont = Afacad_Flux({
  axes: ["slnt"],
  display: "swap",
  subsets: ["latin"],
  weight: "variable",
});

const resumeIntroStyle = defineCssVars({
  "--resume-section-background": designTokens.colors.resumePaper,
  "--resume-section-foreground": designTokens.colors.brandRed,
  "--resume-section-min-block":
    designTokens.components.resumeIntroSection.minBlockSize,
});

const resumeTitleFontVariationMapping = {
  x: {
    max: -14,
    min: 0,
    name: "slnt",
  },
  y: {
    max: 1000,
    min: 100,
    name: "wght",
  },
} as const satisfies FontVariationMapping;

export function ResumeIntroSection() {
  const trackingRef = useRef<HTMLDivElement>(null);
  const { cursorX, cursorY, isActive, isEnabled, position } =
    useVariableFontCursor(trackingRef);

  return (
    <section
      aria-labelledby="resume-intro-heading"
      className={styles.resumeIntroSection}
      data-section-id="resume-intro"
      id="resume-intro"
      style={resumeIntroStyle}
    >
      <div
        className={styles.resumeIntroTracking}
        data-cursor-active={isActive}
        data-cursor-enabled={isEnabled}
        ref={trackingRef}
      >
        <span aria-hidden="true" className={styles.resumeCursor}>
          <motion.span
            className={cx(
              styles.resumeCursorGuide,
              styles.resumeCursorVertical,
            )}
            data-resume-cursor="vertical"
            style={{ x: cursorX }}
          />
          <motion.span
            className={cx(
              styles.resumeCursorGuide,
              styles.resumeCursorHorizontal,
            )}
            data-resume-cursor="horizontal"
            style={{ y: cursorY }}
          />
          <motion.span
            className={styles.resumeCursorSquarePosition}
            data-resume-cursor="square"
            style={{ x: cursorX, y: cursorY }}
          >
            <span className={styles.resumeCursorSquare} />
          </motion.span>
        </span>
        <h2
          className={cx(styles.resumeIntroTitle, resumeTitleFont.className)}
          id="resume-intro-heading"
        >
          <VariableFontAndCursor
            fontVariationMapping={resumeTitleFontVariationMapping}
            position={position}
          >
            Résumé
          </VariableFontAndCursor>
        </h2>
      </div>
      <SectionScrollButton
        ariaLabel="Scroll to résumé"
        direction="down"
        placement="bottom"
        targetSection="resume"
      />
    </section>
  );
}
