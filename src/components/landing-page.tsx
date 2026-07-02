import { AreaSection } from "@/components/area-section";
import { BrandWordmark } from "@/components/brand-wordmark";
import { LandingStage } from "@/components/landing-stage";
import { PortfolioFooter } from "@/components/portfolio-footer";
import { ResumeIntroSection } from "@/components/resume-intro-section";
import { ResumeSection } from "@/components/resume-section";
import { SectionScrollButton } from "@/components/section-scroll-button";
import { SecondSection } from "@/components/second-section";

export function LandingPage() {
  return (
    <div
      className="relative isolate h-[100svh] overflow-y-auto snap-y snap-mandatory"
      data-section-scroll-root
    >
      <main className="relative z-10">
        <LandingStage sectionId="landing">
          <BrandWordmark />
          <SectionScrollButton
            ariaLabel="Scroll to intro page"
            direction="down"
            placement="bottom"
            targetSection="intro"
          />
        </LandingStage>
        <SecondSection />
        <AreaSection />
        <ResumeIntroSection />
        <ResumeSection />
      </main>
      <PortfolioFooter />
      <div
        aria-hidden="true"
        className="h-px snap-end snap-always"
        data-footer-snap
      />
    </div>
  );
}
