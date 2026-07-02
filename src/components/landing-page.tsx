import { AreaSection } from "@/components/area-section";
import { BrandWordmark } from "@/components/brand-wordmark";
import { LandingStage } from "@/components/landing-stage";
import { ResumeIntroSection } from "@/components/resume-intro-section";
import { ResumeSection } from "@/components/resume-section";
import { SectionScrollButton } from "@/components/section-scroll-button";
import { SecondSection } from "@/components/second-section";

export function LandingPage() {
  return (
    <main
      className="h-[100svh] overflow-y-auto snap-y snap-mandatory"
      data-section-scroll-root
    >
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
  );
}
