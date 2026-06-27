"use client";

import { useEffect, useRef, useState } from "react";
import { designTokens } from "@/config/design-tokens";
import { siteCopy } from "@/config/copy";
import { useGlitchLines } from "@/hooks/use-glitch-lines";
import { defineCssVars } from "@/lib/css-vars";

const introTokens = designTokens.components.introRoles;
const glitchTokens = designTokens.components.glitchText;

const introStyle = {
  ...defineCssVars({
    "--intro-column-gap": introTokens.columnGap,
    "--intro-font-size": introTokens.fontSize,
  }),
  columnGap: "var(--intro-column-gap)",
  fontFamily: "var(--font-brand)",
  fontSize: "var(--intro-font-size)",
  fontWeight: introTokens.fontWeight,
  letterSpacing: introTokens.letterSpacing,
  lineHeight: introTokens.lineHeight,
};

type StableGlitchLineProps = {
  display: string;
  final: string;
};

function StableGlitchLine({ display, final }: StableGlitchLineProps) {
  return (
    <span className="relative block whitespace-nowrap">
      <span aria-hidden="true" className="invisible block">
        {final}
      </span>
      <span aria-hidden="true" className="absolute inset-0 block">
        {display}
      </span>
    </span>
  );
}

export function IntroRoleCluster() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [isGlitchActive, setIsGlitchActive] = useState(false);
  const displayLines = useGlitchLines({
    active: isGlitchActive,
    durationMs: glitchTokens.durationMs,
    frameCount: glitchTokens.frameCount,
    glyphs: siteCopy.glitch.glyphs,
    handsetDurationMs: glitchTokens.handsetDurationMs,
    handsetStartDelayMs: glitchTokens.handsetStartDelayMs,
    lines: siteCopy.intro.lines,
    scrambleIntervalMs: glitchTokens.scrambleIntervalMs,
    sequenceGapMs: glitchTokens.sequenceGapMs,
  });

  useEffect(() => {
    const heading = headingRef.current;

    if (!heading) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry?.isIntersecting &&
          entry.intersectionRatio >= introTokens.glitchVisibilityThreshold
        ) {
          setIsGlitchActive(true);
          observer.disconnect();
        }
      },
      { threshold: introTokens.glitchVisibilityThreshold },
    );

    observer.observe(heading);

    return () => observer.disconnect();
  }, []);

  return (
    <h2
      aria-label={siteCopy.intro.ariaLabel}
      className="m-0 grid max-w-full grid-cols-[max-content_max-content] items-start text-left lowercase"
      id="intro-heading"
      ref={headingRef}
      style={introStyle}
    >
      <StableGlitchLine
        display={displayLines[0] ?? siteCopy.intro.lines[0]}
        final={siteCopy.intro.lines[0]}
      />
      <span className="flex flex-col">
        {siteCopy.intro.lines.slice(1).map((line, index) => (
          <StableGlitchLine
            display={displayLines[index + 1] ?? line}
            final={line}
            key={line}
          />
        ))}
      </span>
    </h2>
  );
}
