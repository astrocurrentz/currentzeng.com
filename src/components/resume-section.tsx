import { designTokens } from "@/config/design-tokens";
import { resumeUrl, projectLinks } from "@/config/portfolio";
import { defineCssVars } from "@/lib/css-vars";
import styles from "./resume-sections.module.css";

const resumeSectionStyle = defineCssVars({
  "--resume-section-background": designTokens.colors.resumePaper,
  "--resume-section-foreground": designTokens.colors.brandRed,
  "--resume-section-min-block":
    designTokens.components.resumeSection.minBlockSize,
});

export function ResumeSection() {
  return (
    <section
      aria-labelledby="resume-heading"
      className={styles.resumeSection}
      data-section-id="resume"
      id="resume"
      tabIndex={-1}
      style={resumeSectionStyle}
    >
      <div className={styles.resumeContent}>
        <h2 id="resume-heading">Résumé</h2>
        <p>
          My experience includes QA automation, diagnostic tooling, and testing
          across software, APIs, firmware, and hardware, alongside web and iOS
          product development.
        </p>
        <nav
          aria-label="Résumé and project links"
          className={styles.resumeLinks}
        >
          <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
            Open résumé PDF ↗
          </a>
          <a href={resumeUrl} download>
            Download résumé PDF
          </a>
          <a
            href={projectLinks.reindeer}
            target="_blank"
            rel="noopener noreferrer"
          >
            Reindeer Education ↗
          </a>
          <a href={projectLinks.bazi} target="_blank" rel="noopener noreferrer">
            BaZi Atlas on the App Store ↗
          </a>
        </nav>
        <div className={styles.resumeFrame}>
          <object
            aria-label="Current Zeng résumé PDF"
            className={styles.resumeObject}
            data={resumeUrl}
            type="application/pdf"
          >
            <p className={styles.resumeFallback}>
              <a href={resumeUrl}>Open the résumé PDF</a>
            </p>
          </object>
        </div>
      </div>
    </section>
  );
}
