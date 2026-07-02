export const designTokens = {
  colors: {
    brandRed: "#6C0A00",
    brandWhite: "#FFFFFF",
    resumePaper: "#fffbf8",
  },
  fonts: {
    sans:
      '"Geist", "Geist Fallback", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono:
      '"Geist Mono", "Geist Mono Fallback", ui-monospace, "SFMono-Regular", Consolas, monospace',
    brand:
      '"DT Getai Grotesk Display", "Arial Black", Impact, ui-sans-serif, system-ui, sans-serif',
    titleFallback: ["Arial Black", "Impact", "system-ui", "sans-serif"],
  },
  artboard: {
    width: 4000,
    height: 3000,
    aspectRatio: "4 / 3",
  },
  components: {
    landingStage: {
      minBlockSize: "100svh",
      overflow: "hidden",
    },
    secondSection: {
      minBlockSize: "100svh",
    },
    areaSection: {
      minBlockSize: "100svh",
      pressReleaseMs: 280,
      pressScrollDelayMs: 120,
    },
    resumeIntroSection: {
      minBlockSize: "100svh",
    },
    resumeSection: {
      minBlockSize: "100svh",
    },
    portfolioFooter: {
      blockSize: "clamp(20rem, 48svh, 36rem)",
      wordmarkFontSize: "clamp(8rem, 24vw, 24rem)",
      wordmarkTranslateY: "0%",
    },
    introRoles: {
      columnGap: "clamp(1rem, 4vw, 10rem)",
      fontSize: "clamp(1.375rem, 5.1vw, 12.75rem)",
      fontWeight: 900,
      glitchVisibilityThreshold: 0.6,
      letterSpacing: "0",
      lineHeight: 1.35,
    },
    brandWordmark: {
      insetInlineStart: "clamp(1.25rem, 4vw, 10rem)",
      insetBlockEnd: "clamp(4rem, 9.5svh, 18rem)",
      fontSize: "clamp(3.75rem, 8.75vw, 17rem)",
      fontWeight: 900,
      letterSpacing: "0",
      lineHeight: "0.82",
    },
    glitchText: {
      durationMs: 300,
      frameCount: 18,
      handsetDurationMs: 420,
      handsetStartDelayMs: 180,
      scrambleIntervalMs: 55,
      sequenceGapMs: 55,
    },
  },
} as const;

export type DesignTokens = typeof designTokens;
