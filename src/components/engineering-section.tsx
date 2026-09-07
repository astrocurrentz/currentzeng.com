import { engineeringProjects, resumeUrl } from "@/config/portfolio";
import styles from "./portfolio-overview.module.css";

export function EngineeringSection() {
  return (
    <section
      id="engineering"
      data-section-id="engineering"
      aria-labelledby="engineering-heading"
      tabIndex={-1}
      className={styles.engineering}
    >
      <header className={styles.sectionHeader}>
        <p className={styles.eyebrow}>Automation, systems & product quality</p>
        <h2 id="engineering-heading">Engineering</h2>
        <p className={styles.summary}>
          My QA work spans software, hardware, APIs, and connected systems. I
          also build web and iOS products, bringing the same attention to how
          they work and how people use them.
        </p>
        <a
          href={resumeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.textLink}
        >
          Open résumé PDF <span aria-hidden="true">↗</span>
        </a>
      </header>
      <div className={styles.projects}>
        {engineeringProjects.map((project, index) => (
          <article key={project.title} className={styles.project}>
            <span className={styles.number} aria-hidden="true">
              0{index + 1}
            </span>
            <div>
              <p className={styles.eyebrow}>{project.context}</p>
              <h3>{project.title}</h3>
              <p>{project.contribution}</p>
              <p className={styles.tools}>{project.tools}</p>
              <p>
                <strong>Outcome:</strong> {project.outcome}
              </p>
              {"href" in project ? (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.textLink}
                >
                  {project.linkLabel} <span aria-hidden="true">↗</span>
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
      <aside
        className={styles.creativeNote}
        aria-labelledby="creative-production-heading"
      >
        <p className={styles.eyebrow}>Creative production</p>
        <h3 id="creative-production-heading">Beyond the software</h3>
        <p>
          As co-founder and director of FCMS, I directed six events with
          audiences of 100–700, coordinating planning, scheduling, volunteers,
          budgets, technical production, and live sound. I also led FCMS On Set,
          a 12-video live performance project documenting local artists.
        </p>
        <a href="#area" className={styles.textLink}>
          Explore creative work <span aria-hidden="true">↓</span>
        </a>
      </aside>
    </section>
  );
}
