"use client";

import dynamic from "next/dynamic";
import Image, { type StaticImageData } from "next/image";
import {
  type CSSProperties,
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import ninetiesSupply from "../../assets/visual works/90 supplies.svg";
import d7 from "../../assets/visual works/d7.svg";
import fcms from "../../assets/visual works/fcms.svg";
import freewill from "../../assets/visual works/freewill.svg";
import reindeer from "../../assets/visual works/reindeer.svg";
import solarstatics from "../../assets/visual works/solarstatics.svg";
import tattooWorks from "../../assets/visual works/tattoo works.svg";
import tuna from "../../assets/visual works/tuna.svg";
import solarstaticPanelAsset from "../../assets/solarstatics/Asset 1.svg";
import styles from "./visual-works-gallery.module.css";

const FcmsGravityScene = dynamic(
  () =>
    import("@/components/fcms-gravity-scene").then(
      (module) => module.FcmsGravityScene,
    ),
  { ssr: false },
);

const D7GravityScene = dynamic(
  () =>
    import("@/components/d7-gravity-scene").then(
      (module) => module.D7GravityScene,
    ),
  { ssr: false },
);

const NinetiesSupplyGravityScene = dynamic(
  () =>
    import("@/components/nineties-supply-gravity-scene").then(
      (module) => module.NinetiesSupplyGravityScene,
    ),
  { ssr: false },
);

const TunaGravityScene = dynamic(
  () =>
    import("@/components/tuna-gravity-scene").then(
      (module) => module.TunaGravityScene,
    ),
  { ssr: false },
);

const ReindeerGravityScene = dynamic(
  () =>
    import("@/components/reindeer-gravity-scene").then(
      (module) => module.ReindeerGravityScene,
    ),
  { ssr: false },
);

const FreewillPanel = dynamic(
  () =>
    import("@/components/freewill-panel").then(
      (module) => module.FreewillPanel,
    ),
  { ssr: false },
);

const TattooWorksGravityScene = dynamic(
  () =>
    import("@/components/tattoo-works-gravity-scene").then(
      (module) => module.TattooWorksGravityScene,
    ),
  { ssr: false },
);

type VisualWorkId =
  | "fcms"
  | "reindeer"
  | "freewill"
  | "d7"
  | "nineties-supply"
  | "solarstatics"
  | "tuna"
  | "tattoo-works";

type VisualWorkPlacement = {
  left: number;
  top: number;
  width: number;
  aspectRatio: string;
};

type VisualWorkVisitLink = {
  brand: string;
  href: string;
};

type VisualWork = {
  id: VisualWorkId;
  title: string;
  image: StaticImageData;
  placement: VisualWorkPlacement;
  visitLink?: VisualWorkVisitLink;
};

type VisualWorkStyle = CSSProperties & {
  "--work-aspect-ratio": string;
  "--work-left": string;
  "--work-top": string;
  "--work-width": string;
};

type VisualWorksGalleryProps = {
  isActive: boolean;
};

const visualWorks = [
  {
    id: "fcms",
    title: "Fuzz Chorus Musicians Society",
    image: fcms,
    placement: {
      left: 27.45,
      top: 18.8,
      width: 13.65,
      aspectRatio: "546 / 454",
    },
    visitLink: {
      brand: "FCMS",
      href: "https://www.instagram.com/fcms_official?igsh=MWIyemhxZXhhdG5mcg==",
    },
  },
  {
    id: "reindeer",
    title: "Reindeer",
    image: reindeer,
    placement: {
      left: 47.75,
      top: 9.3,
      width: 14.275,
      aspectRatio: "1 / 1",
    },
    visitLink: {
      brand: "Reindeer Education",
      href: "https://www.reindeereducation.com/",
    },
  },
  {
    id: "freewill",
    title: "Freewill",
    image: freewill,
    placement: {
      left: 66.725,
      top: 26.266667,
      width: 8.775,
      aspectRatio: "351 / 461",
    },
  },
  {
    id: "d7",
    title: "D7",
    image: d7,
    placement: {
      left: 13.1,
      top: 41.6,
      width: 21.175,
      aspectRatio: "847 / 245",
    },
    visitLink: {
      brand: "D7 Tattoo",
      href: "https://www.instagram.com/didi_tattoo_?igsh=MW8xODk5ZnE3MjBxYw==",
    },
  },
  {
    id: "nineties-supply",
    title: "Nineties Supply",
    image: ninetiesSupply,
    placement: {
      left: 42,
      top: 36,
      width: 17.65,
      aspectRatio: "706 / 638",
    },
  },
  {
    id: "solarstatics",
    title: "Solarstatics",
    image: solarstatics,
    placement: {
      left: 22.55,
      top: 58.833333,
      width: 15.8,
      aspectRatio: "632 / 404",
    },
    visitLink: {
      brand: "Solar Static Studio",
      href: "https://www.solarstatic.xyz/",
    },
  },
  {
    id: "tuna",
    title: "Tuna",
    image: tuna,
    placement: {
      left: 39.85,
      top: 68.4,
      width: 19.9,
      aspectRatio: "796 / 558",
    },
    visitLink: {
      brand: "the Band Yorutsuna",
      href: "https://www.instagram.com/yorutsuna_band?igsh=djg2cWF4Z3BoaWkw",
    },
  },
  {
    id: "tattoo-works",
    title: "Tattoo Works",
    image: tattooWorks,
    placement: {
      left: 63.475,
      top: 45.7,
      width: 17.925,
      aspectRatio: "717 / 1036",
    },
  },
] as const satisfies readonly VisualWork[];

function getWorkStyle(work: VisualWork): VisualWorkStyle {
  return {
    "--work-aspect-ratio": work.placement.aspectRatio,
    "--work-left": `${work.placement.left}%`,
    "--work-top": `${work.placement.top}%`,
    "--work-width": `${work.placement.width}%`,
  };
}

export function VisualWorksGallery({ isActive }: VisualWorksGalleryProps) {
  const activeTriggerRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [selectedWork, setSelectedWork] = useState<VisualWork | null>(null);

  const closeOverlay = useCallback(() => {
    const trigger = activeTriggerRef.current;

    setSelectedWork(null);
    window.requestAnimationFrame(() => trigger?.focus());
  }, []);

  const openOverlay = useCallback(
    (work: VisualWork, event: MouseEvent<HTMLButtonElement>) => {
      activeTriggerRef.current = event.currentTarget;
      setSelectedWork(work);
    },
    [],
  );

  useEffect(() => {
    if (selectedWork === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      closeOverlay();
    };

    closeButtonRef.current?.focus();
    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeOverlay, selectedWork]);

  return (
    <section
      aria-hidden={isActive ? undefined : true}
      aria-labelledby="visual-works-heading"
      className={styles.visualWorks}
      inert={isActive ? undefined : true}
    >
      <h2 className={styles.title} id="visual-works-heading">
        Visual Works
      </h2>
      <div
        aria-hidden={selectedWork === null ? undefined : true}
        className={styles.galleryViewport}
        inert={selectedWork === null ? undefined : true}
      >
        <div className={styles.artboard}>
          {visualWorks.map((work) => (
            <button
              aria-controls="visual-work-overlay"
              aria-haspopup="dialog"
              aria-label={`Open ${work.title} project`}
              className={styles.workButton}
              data-visual-work={work.id}
              key={work.id}
              onClick={(event) => openOverlay(work, event)}
              style={getWorkStyle(work)}
              type="button"
            >
              <span className={styles.artwork}>
                <Image
                  alt=""
                  fill
                  sizes="(max-width: 767px) 36vw, 22vw"
                  src={work.image}
                  unoptimized
                />
              </span>
            </button>
          ))}
        </div>
      </div>
      {selectedWork === null ? null : (
        <div
          aria-labelledby={`visual-work-${selectedWork.id}-title`}
          className={styles.overlay}
          data-visual-work-overlay={selectedWork.id}
          id="visual-work-overlay"
          role="dialog"
        >
          <div className={styles.overlayFrame}>
            <h3
              className={styles.overlayTitle}
              id={`visual-work-${selectedWork.id}-title`}
            >
              {selectedWork.title}
            </h3>
            {selectedWork.id === "fcms" ? <FcmsGravityScene /> : null}
            {selectedWork.id === "reindeer" ? <ReindeerGravityScene /> : null}
            {selectedWork.id === "freewill" ? <FreewillPanel /> : null}
            {selectedWork.id === "d7" ? <D7GravityScene /> : null}
            {selectedWork.id === "nineties-supply" ? (
              <NinetiesSupplyGravityScene />
            ) : null}
            {selectedWork.id === "tuna" ? <TunaGravityScene /> : null}
            {selectedWork.id === "tattoo-works" ? (
              <TattooWorksGravityScene />
            ) : null}
            {selectedWork.id === "solarstatics" ? (
              <div
                aria-hidden="true"
                className={styles.solarstaticPanel}
                data-solarstatic-panel=""
              >
                <span className={styles.solarstaticAsset}>
                  <Image
                    alt=""
                    fill
                    sizes="(max-width: 767px) 66vw, 44vw"
                    src={solarstaticPanelAsset}
                    unoptimized
                  />
                </span>
              </div>
            ) : null}
            {selectedWork.visitLink === undefined ? null : (
              <a
                className={styles.visitLink}
                data-visual-work-visit-link=""
                href={selectedWork.visitLink.href}
                rel="noopener noreferrer"
                target="_blank"
              >
                Visit {selectedWork.visitLink.brand}
              </a>
            )}
          </div>
          <button
            aria-label={`Close ${selectedWork.title} project`}
            className={styles.closeButton}
            onClick={closeOverlay}
            ref={closeButtonRef}
            type="button"
          >
            <span aria-hidden="true" className={styles.closeIcon} />
          </button>
        </div>
      )}
    </section>
  );
}
