# Current Zeng — portfolio

A portfolio of QA automation, software projects, visual design, and music. Built with Next.js App Router, React, and TypeScript. The illustrated creative portfolio sits alongside a directly addressable engineering overview.

## Development

Use Node.js 22 and npm:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. This repository uses Next.js 16; consult the installed guides in `node_modules/next/dist/docs/` before changing framework behaviour.

## Structure

- `src/app` owns the page shell and global styles. Most overview content is rendered on the server; interactive previews are client components.
- `src/config/copy.ts` contains shared site copy; `src/config/portfolio.ts` contains résumé/project URLs and engineering summaries. Design tokens live in `src/config/design-tokens.ts`.
- `src/components` contains the illustrated explorer, galleries, engineering overview, and résumé viewer. `Modal` uses the native dialog top layer for background inertness and nested focus handling.
- `src/components/selected-works` contains the BaZi UI preview. It uses fixed sample data; editing inputs does not calculate a chart. The App Store link leads to the separate iOS app.
- `/#engineering`, `/#area`, `/#resume`, and `/#contact` are direct entry points. All PDF links use the shared `resumeUrl`.

Keep source files below 600 lines and use shared styles/components where appropriate.

## Verification

```sh
npm run lint
npm run build
npx playwright install chromium webkit
npm run test:e2e
```

The browser suite starts the production server on port 3100. Rebuild after changes before running it. Use `npm run test:e2e:ui` for interactive debugging. Playwright tests desktop Chromium, desktop WebKit, and an iPhone-sized WebKit viewport. They cover navigation and deep links, the PDF response and link consistency, dialog focus and nested dismissal, input controls, text enlargement, and targeted axe accessibility checks.

GitHub Actions runs lint, build, and the suite on pushes and pull requests. Failed runs retain the HTML report and traces. Automated accessibility checks and WebKit emulation do not replace manual assistive-technology testing or physical iPhone Safari testing.

Before publication, check desktop Safari/Chrome, physical iPhone Safari, keyboard-only navigation, reduced motion, browser zoom at 200%, PDF page navigation/downloads, and outbound links. Check third-party media manually; external availability is not a CI gate.

## Résumé publication

The public PDF is an exact copy of the supplied `Current_Zeng_Apple_Creativity_Apps_SDET 3.pdf`. The engineering summaries have been reconciled against this version.

All résumé links use `public/resumes/current-zeng-resume-long-pager.pdf` to preserve existing URLs. The native viewer supports the PDF's actual pages without positioned HTML hotspots or an assumed combined-page aspect ratio. Visible HTML download and project links remain available outside the viewer.

For future replacements, inspect every page for spelling, grammar, clipping, and readability; reconcile the website summaries; then copy the approved PDF to the existing public path and compare the served bytes with the source. Run the verification commands before publishing.

The current supplied PDF renders correctly, but some extracted text has character-mapping errors (for example, “software” can extract as “soDware”). It is preserved unchanged. A fresh export with correct Unicode mappings would improve automated parsing.

The verification workflow does not itself deploy the website.
