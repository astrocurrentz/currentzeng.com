import { IntroRoleCluster } from "@/components/intro-role-cluster";
import { SectionScrollButton } from "@/components/section-scroll-button";
import { designTokens } from "@/config/design-tokens";
import { defineCssVars } from "@/lib/css-vars";

const secondSectionTokens = designTokens.components.secondSection;

const secondSectionStyle = defineCssVars({
  "--second-section-background": designTokens.colors.brandRed,
  "--second-section-foreground": designTokens.colors.brandWhite,
  "--second-section-min-block": secondSectionTokens.minBlockSize,
});

export function SecondSection() {
  return (
    <section
      aria-labelledby="intro-heading"
      className="relative isolate flex min-h-[var(--second-section-min-block)] snap-start snap-always items-center justify-center overflow-hidden bg-[var(--second-section-background)] text-[var(--second-section-foreground)]"
      data-section-id="intro"
      id="intro"
      style={secondSectionStyle}
    >
      <SectionScrollButton
        ariaLabel="Scroll to landing page"
        direction="up"
        placement="top"
        targetSection="landing"
      />
      <IntroRoleCluster />
      <SectionScrollButton
        ariaLabel="Scroll to area page"
        direction="down"
        placement="bottom"
        targetSection="area"
      />
    </section>
  );
}
