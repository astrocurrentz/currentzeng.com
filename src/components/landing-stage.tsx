import type { ReactNode } from "react";
import type { SectionId } from "@/components/section-scroll-button";
import { designTokens } from "@/config/design-tokens";
import { cx } from "@/lib/class-names";
import { defineCssVars } from "@/lib/css-vars";

type LandingStageProps = {
  children: ReactNode;
  className?: string;
  sectionId?: SectionId;
};

const stageStyle = defineCssVars({
  "--landing-background": designTokens.colors.brandRed,
  "--landing-foreground": designTokens.colors.brandWhite,
  "--landing-min-block": designTokens.components.landingStage.minBlockSize,
});

export function LandingStage({
  children,
  className,
  sectionId,
}: LandingStageProps) {
  return (
    <section
      className={cx(
        "relative isolate min-h-[var(--landing-min-block)] snap-start snap-always overflow-hidden bg-[var(--landing-background)] text-[var(--landing-foreground)]",
        className,
      )}
      data-section-id={sectionId}
      id={sectionId}
      style={stageStyle}
    >
      {children}
    </section>
  );
}
