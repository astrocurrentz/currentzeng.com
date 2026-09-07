import { EngineeringSection } from "@/components/engineering-section";
import { PortfolioNavigation } from "@/components/portfolio-navigation";
import { resumeUrl } from "@/config/portfolio";
import styles from "./portfolio-overview.module.css";
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
      className="relative isolate h-[100svh] overflow-y-auto snap-y snap-proximity"
      data-section-scroll-root
    >
      <PortfolioNavigation />
      <main className="relative z-10">
        <LandingStage sectionId="landing">
          <BrandWordmark />
          <div className={styles.tagline}>
            <p>QA engineer, software builder, and musician.</p>
            <a
              className={styles.textLink}
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open résumé PDF ↗
            </a>
          </div>
          <SectionScrollButton
            ariaLabel="Scroll to intro page"
            direction="down"
            placement="bottom"
            targetSection="intro"
          />
        </LandingStage>
        <SecondSection />
        <EngineeringSection />
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
