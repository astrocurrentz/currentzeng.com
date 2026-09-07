export const resumeUrl = "/resumes/current-zeng-resume-long-pager.pdf";

export const projectLinks = {
  bazi: "https://apps.apple.com/ca/app/b%C4%81z%C3%AC-atlas/id6761666394",
  reindeer: "https://www.reindeereducation.com/",
} as const;

// Source: the supplied Apple Creativity Apps SDET résumé, published at resumeUrl.
// Keep these summaries aligned with it; do not invent metrics or testing claims.
export const engineeringProjects = [
  {
    title: "QA automation & diagnostics",
    context: "SaaS telematics, web platforms, and connected hardware",
    contribution:
      "I used prompt-guided AI workflows to migrate UI automation from Sahi to Playwright, reviewing, debugging, and validating generated code before release. I built repeatable Cursor prompts for structured Jira test cases and used Atlassian MCP to identify missing scenarios. My work also includes hardware-validation tools, remote diagnostics, and cross-layer defect investigation.",
    tools: "Playwright · Python · Cursor · Jira · Atlassian MCP",
    outcome:
      "Less manual test-authoring effort, more consistent test cases, and expanded functional and regression coverage.",
  },
  {
    title: "BaZi Atlas",
    context: "A bilingual iOS app for chart analysis and learning",
    contribution:
      "I built and self-tested the bilingual app and tested its TypeScript calculation engine, including true solar time and chart analysis. I tested Swift/WidgetKit features, Sign in with Apple, purchases, cloud backup, city search, local storage, and deep links.",
    tools: "React Native · Expo · TypeScript · Swift · SQLite · WidgetKit",
    outcome:
      "Chart analysis, comparison, learning, and knowledge lookup in one bilingual app.",
    href: projectLinks.bazi,
    linkLabel: "View BaZi Atlas on the App Store",
  },
  {
    title: "Reindeer Education",
    context: "A school website and visit-booking workflow",
    contribution:
      "I built responsive program pages, faculty profiles, galleries, and visit booking. The booking flow includes input validation, spam protection, UUID idempotency, and email delivery.",
    tools: "Next.js · React · TypeScript · Tailwind CSS · Resend · Vitest",
    outcome:
      "Reusable components and content-driven routing support site updates, with a booking flow that guards against duplicate requests.",
    href: projectLinks.reindeer,
    linkLabel: "Visit Reindeer Education",
  },
] as const;
