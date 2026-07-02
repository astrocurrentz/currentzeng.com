import styles from "./music-works-panel.module.css";

type MusicWork = {
  title: string;
  role: string;
  spotifySrc: string;
};

type MusicWorksPanelProps = {
  isActive: boolean;
};

const musicWorks = [
  {
    title: "Freewill's 1st instrumental LP, 2026, WIP",
    role: "as composer, producer and bassist",
    spotifySrc:
      "https://open.spotify.com/embed/album/4qdheVyhSNhNNinrO6hcmY?utm_source=generator&theme=0&si=1965ba79731e4f19",
  },
  {
    title: "Freewill's 2nd EP, 2024",
    role: "as composer, producer and bassist",
    spotifySrc:
      "https://open.spotify.com/embed/album/0cw5qqFEUoWosvSBu4jvua?utm_source=generator&theme=0&si=04cedebc55704f76",
  },
  {
    title: "Personncal Album",
    role: "as composer, producer, bassist and guitarist",
    spotifySrc:
      "https://open.spotify.com/embed/album/6rV2szkEw580rRSVjGzR7m?utm_source=generator&theme=0&si=19f2325118c240bc",
  },
] as const satisfies readonly MusicWork[];

export function MusicWorksPanel({ isActive }: MusicWorksPanelProps) {
  return (
    <section
      aria-hidden={isActive ? undefined : true}
      aria-labelledby="music-works-heading"
      className={styles.musicWorks}
      inert={isActive ? undefined : true}
    >
      <h2 className={styles.railTitle} id="music-works-heading">
        music works
      </h2>
      <div className={styles.scrollRegion} tabIndex={isActive ? 0 : -1}>
        <div className={styles.list}>
          {musicWorks.map((work) => (
            <article className={styles.work} key={work.spotifySrc}>
              <header className={styles.workHeader}>
                <h3 className={styles.workTitle}>{work.title}</h3>
                <p className={styles.workRole}>{work.role}</p>
              </header>
              <iframe
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                allowFullScreen
                className={styles.embed}
                data-testid="embed-iframe"
                frameBorder="0"
                height="352"
                loading="lazy"
                src={work.spotifySrc}
                title={`Spotify embed for ${work.title}`}
                width="100%"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
