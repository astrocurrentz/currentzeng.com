import { AreaExplorer } from "@/components/area-explorer";
import { designTokens } from "@/config/design-tokens";
import { defineCssVars } from "@/lib/css-vars";

const areaSectionTokens = designTokens.components.areaSection;

const areaSectionStyle = defineCssVars({
  "--area-section-background": designTokens.colors.brandRed,
  "--area-section-foreground": designTokens.colors.brandWhite,
  "--area-section-min-block": areaSectionTokens.minBlockSize,
});

export function AreaSection() {
  return (
    <section
      aria-labelledby="area-heading"
      className="relative isolate min-h-[var(--area-section-min-block)] snap-start snap-always overflow-hidden bg-[var(--area-section-background)] text-[var(--area-section-foreground)]"
      data-section-id="area"
      id="area"
      style={areaSectionStyle}
    >
      <h2 className="sr-only" id="area-heading">
        Area Page
      </h2>
      <AreaExplorer />
    </section>
  );
}
