import { designTokens } from "@/config/design-tokens";
import { defineCssVars } from "@/lib/css-vars";
import styles from "./resume-sections.module.css";

const resumePdfPath = "/resumes/current-zeng-resume-long-pager.pdf";

const resumeProjectLinks = [
  {
    ariaLabel: "Open Reindeer Education Website and Visit Booking System",
    height: 2.05,
    href: "https://www.reindeereducation.com/",
    left: 22.222,
    top: 63.15,
    width: 50.654,
  },
  {
    ariaLabel: "Open Bazi Atlas iOS App in the App Store",
    height: 2.05,
    href: "https://apps.apple.com/ca/app/b%C4%81z%C3%AC-atlas/id6761666394",
    left: 22.222,
    top: 76.25,
    width: 19.935,
  },
] as const;

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
      style={resumeSectionStyle}
    >
      <h2 className="sr-only" id="resume-heading">
        Resume
      </h2>
      <div className={styles.resumeFrame}>
        <object
          aria-label="Current Zeng resume PDF"
          className={styles.resumeObject}
          data={`${resumePdfPath}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
          type="application/pdf"
        >
          <p className={styles.resumeFallback}>
            <a href={resumePdfPath}>Open the résumé PDF</a>
          </p>
        </object>
        {resumeProjectLinks.map((link) => (
          <a
            aria-label={link.ariaLabel}
            className={styles.resumeProjectLink}
            href={link.href}
            key={link.href}
            rel="noopener noreferrer"
            style={{
              height: `${link.height}%`,
              left: `${link.left}%`,
              top: `${link.top}%`,
              width: `${link.width}%`,
            }}
            target="_blank"
          />
        ))}
      </div>
    </section>
  );
}
