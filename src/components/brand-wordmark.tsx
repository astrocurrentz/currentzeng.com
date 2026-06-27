"use client";

import { designTokens } from "@/config/design-tokens";
import { siteCopy } from "@/config/copy";
import { useGlitchLines } from "@/hooks/use-glitch-lines";
import { defineCssVars } from "@/lib/css-vars";

type BrandWordmarkProps = {
  lines?: readonly string[];
};

const wordmarkTokens = designTokens.components.brandWordmark;
const glitchTokens = designTokens.components.glitchText;

const wordmarkStyle = {
  ...defineCssVars({
    "--brand-wordmark-block-end": wordmarkTokens.insetBlockEnd,
    "--brand-wordmark-font-size": wordmarkTokens.fontSize,
    "--brand-wordmark-inline-start": wordmarkTokens.insetInlineStart,
  }),
  color: "var(--landing-foreground)",
  fontFamily: "var(--font-brand)",
  fontSize: "var(--brand-wordmark-font-size)",
  fontWeight: wordmarkTokens.fontWeight,
  insetBlockEnd: "var(--brand-wordmark-block-end)",
  insetInlineStart: "var(--brand-wordmark-inline-start)",
  letterSpacing: wordmarkTokens.letterSpacing,
  lineHeight: wordmarkTokens.lineHeight,
};

export function BrandWordmark({
  lines = siteCopy.brand.lines,
}: BrandWordmarkProps) {
  const displayLines = useGlitchLines({
    durationMs: glitchTokens.durationMs,
    frameCount: glitchTokens.frameCount,
    glyphs: siteCopy.glitch.glyphs,
    handsetDurationMs: glitchTokens.handsetDurationMs,
    handsetStartDelayMs: glitchTokens.handsetStartDelayMs,
    lines,
    scrambleIntervalMs: glitchTokens.scrambleIntervalMs,
    sequenceGapMs: glitchTokens.sequenceGapMs,
  });

  return (
    <h1
      aria-label={siteCopy.brand.ariaLabel}
      className="absolute m-0 select-none uppercase"
      style={wordmarkStyle}
    >
      {displayLines.map((line, index) => (
        <span aria-hidden="true" className="block" key={index}>
          {line}
        </span>
      ))}
    </h1>
  );
}
