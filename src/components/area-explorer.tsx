"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import czMark from "../../assets/cz.svg";
import earsArt from "../../assets/ears art.png";
import eyesArt from "../../assets/eyes art.png";
import earsLabel from "../../assets/lable-forears.png";
import eyesLabel from "../../assets/lable-foreyes.png";
import systemsLabel from "../../assets/lable-forsystems.png";
import systemsArt from "../../assets/systems art.png";
import { SectionScrollButton } from "@/components/section-scroll-button";
import { VisualWorksGallery } from "@/components/visual-works-gallery";
import { designTokens } from "@/config/design-tokens";
import { cx } from "@/lib/class-names";
import styles from "./area-explorer.module.css";

type AreaId = "eyes" | "ears" | "systems";
type PanelId = "home" | AreaId;

type AreaEntry = {
  id: AreaId;
  label: string;
  entryClassName: string;
  labelClassName: string;
  artClassName: string;
  labelImage: typeof eyesLabel;
  artImage: typeof eyesArt;
  artAlt: string;
};

const panelPositions = {
  home: { x: 1, y: 0 },
  eyes: { x: 0, y: 0 },
  ears: { x: 2, y: 0 },
  systems: { x: 1, y: 1 },
} as const satisfies Record<PanelId, { x: number; y: number }>;

const areaEntries: readonly AreaEntry[] = [
  {
    id: "eyes",
    label: "Open eyes area",
    entryClassName: styles.eyesEntry,
    labelClassName: styles.eyesLabel,
    artClassName: styles.eyesArt,
    labelImage: eyesLabel,
    artImage: eyesArt,
    artAlt: "Eyes area",
  },
  {
    id: "ears",
    label: "Open ears area",
    entryClassName: styles.earsEntry,
    labelClassName: styles.earsLabel,
    artClassName: styles.earsArt,
    labelImage: earsLabel,
    artImage: earsArt,
    artAlt: "Ears area",
  },
  {
    id: "systems",
    label: "Open systems area",
    entryClassName: styles.systemsEntry,
    labelClassName: styles.systemsLabel,
    artClassName: styles.systemsArt,
    labelImage: systemsLabel,
    artImage: systemsArt,
    artAlt: "Systems area",
  },
];

const pressReleaseMs = designTokens.components.areaSection.pressReleaseMs;
const pressScrollDelayMs = designTokens.components.areaSection.pressScrollDelayMs;
const traceReturnDelayMs = 580;
const systemsReturnDelayMs = 580;

function useReducedMotionRef() {
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReducedMotion = () => {
      reducedMotionRef.current = mediaQuery.matches;
    };

    syncReducedMotion();
    mediaQuery.addEventListener("change", syncReducedMotion);

    return () => {
      mediaQuery.removeEventListener("change", syncReducedMotion);
    };
  }, []);

  return reducedMotionRef;
}

type ReturnButtonProps = {
  arrowClassName: string;
  className: string;
  label: string;
  onClick: () => void;
};

function ReturnButton({
  arrowClassName,
  className,
  label,
  onClick,
}: ReturnButtonProps) {
  return (
    <button
      aria-label={label}
      className={cx(styles.returnButton, className)}
      onClick={onClick}
      type="button"
    >
      <span
        aria-hidden="true"
        className={cx(styles.returnArrow, arrowClassName)}
      />
    </button>
  );
}

export function AreaExplorer() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const activePanelRef = useRef<PanelId>("home");
  const reducedMotionRef = useReducedMotionRef();
  const traceReturnTimeoutRef = useRef<number | null>(null);
  const systemsReturnTimeoutRef = useRef<number | null>(null);
  const systemsReturnInProgressRef = useRef(false);
  const [activePanel, setActivePanel] = useState<PanelId>("home");
  const [pressedArea, setPressedArea] = useState<AreaId | null>(null);

  const scrollToPanel = useCallback((panel: PanelId, behavior: ScrollBehavior) => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const { x, y } = panelPositions[panel];

    activePanelRef.current = panel;
    setActivePanel(panel);
    viewport.scrollTo({
      behavior,
      left: x * viewport.clientWidth,
      top: y * viewport.clientHeight,
    });
  }, []);

  useLayoutEffect(() => {
    scrollToPanel("home", "auto");
  }, [scrollToPanel]);

  useEffect(() => {
    const handleResize = () => {
      scrollToPanel(activePanelRef.current, "auto");
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [scrollToPanel]);

  useEffect(() => {
    return () => {
      if (traceReturnTimeoutRef.current !== null) {
        window.clearTimeout(traceReturnTimeoutRef.current);
      }

      if (systemsReturnTimeoutRef.current !== null) {
        window.clearTimeout(systemsReturnTimeoutRef.current);
      }
    };
  }, []);

  const moveToPanel = useCallback(
    (panel: PanelId) => {
      scrollToPanel(panel, reducedMotionRef.current ? "auto" : "smooth");
    },
    [reducedMotionRef, scrollToPanel],
  );

  const handleAreaClick = useCallback(
    (area: AreaId) => {
      if (reducedMotionRef.current) {
        moveToPanel(area);
        return;
      }

      setPressedArea(area);
      window.setTimeout(() => setPressedArea(null), pressReleaseMs);
      window.setTimeout(() => moveToPanel(area), pressScrollDelayMs);
    },
    [moveToPanel, reducedMotionRef],
  );

  const returnToAreaHome = useCallback(
    (behavior: ScrollBehavior) => {
      if (systemsReturnTimeoutRef.current !== null) {
        window.clearTimeout(systemsReturnTimeoutRef.current);
        systemsReturnTimeoutRef.current = null;
      }

      scrollToPanel("home", behavior);

      if (behavior === "smooth") {
        systemsReturnInProgressRef.current = true;
        systemsReturnTimeoutRef.current = window.setTimeout(() => {
          systemsReturnInProgressRef.current = false;
          systemsReturnTimeoutRef.current = null;
        }, systemsReturnDelayMs);
        return;
      }

      systemsReturnInProgressRef.current = false;
    },
    [scrollToPanel],
  );

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const handleSystemsWheelReturn = (event: WheelEvent) => {
      if (event.deltaY >= 0 || viewport.scrollTop <= 1) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (systemsReturnInProgressRef.current) {
        return;
      }

      returnToAreaHome(reducedMotionRef.current ? "auto" : "smooth");
    };

    viewport.addEventListener("wheel", handleSystemsWheelReturn, {
      passive: false,
    });

    return () => {
      viewport.removeEventListener("wheel", handleSystemsWheelReturn);
    };
  }, [reducedMotionRef, returnToAreaHome]);

  const scrollPageToLanding = useCallback((behavior: ScrollBehavior) => {
    const scrollRoot = document.querySelector<HTMLElement>(
      "[data-section-scroll-root]",
    );
    const landingSection = document.querySelector<HTMLElement>(
      '[data-section-id="landing"]',
    );

    if (!scrollRoot || !landingSection) {
      return;
    }

    scrollRoot.scrollTo({
      behavior,
      top: landingSection.offsetTop,
    });
  }, []);

  const handleCzReturnClick = useCallback(() => {
    if (traceReturnTimeoutRef.current !== null) {
      window.clearTimeout(traceReturnTimeoutRef.current);
      traceReturnTimeoutRef.current = null;
    }

    if (reducedMotionRef.current) {
      scrollToPanel("home", "auto");
      scrollPageToLanding("auto");
      return;
    }

    scrollToPanel("home", "smooth");
    traceReturnTimeoutRef.current = window.setTimeout(() => {
      scrollPageToLanding("smooth");
      traceReturnTimeoutRef.current = null;
    }, traceReturnDelayMs);
  }, [reducedMotionRef, scrollPageToLanding, scrollToPanel]);

  return (
    <div className={styles.shell}>
      <div
        aria-label={`Area page ${activePanel === "home" ? "main" : activePanel}`}
        className={styles.viewport}
        ref={viewportRef}
      >
        <div className={styles.world}>
          <div className={cx(styles.panel, styles.eyesPanel)}>
            <VisualWorksGallery
              isActive={activePanel === "eyes"}
              key={activePanel === "eyes" ? "eyes-active" : "eyes-idle"}
            />
            <ReturnButton
              arrowClassName={styles.arrowRight}
              className={styles.returnFromEyes}
              label="Return from eyes area"
              onClick={() => moveToPanel("home")}
            />
          </div>
          <div className={cx(styles.panel, styles.homePanel)}>
            <SectionScrollButton
              ariaLabel="Scroll to intro page"
              direction="up"
              placement="top"
              targetSection="intro"
            />
            <div className={styles.artboard}>
              <div className={styles.areaCluster}>
                {areaEntries.map((entry) => (
                  <button
                    aria-label={entry.label}
                    className={cx(
                      styles.areaEntry,
                      entry.entryClassName,
                      pressedArea === entry.id && styles.isPressed,
                    )}
                    key={entry.id}
                    onClick={() => handleAreaClick(entry.id)}
                    type="button"
                  >
                    <span
                      className={cx(
                        styles.entryPiece,
                        styles.entryLabel,
                        entry.labelClassName,
                      )}
                    >
                      <Image
                        alt=""
                        fill
                        sizes="(max-width: 768px) 18vw, 12vw"
                        src={entry.labelImage}
                      />
                    </span>
                    <span
                      className={cx(
                        styles.entryPiece,
                        styles.entryArt,
                        entry.artClassName,
                      )}
                    >
                      <Image
                        alt={entry.artAlt}
                        fill
                        sizes="(max-width: 768px) 24vw, 18vw"
                        src={entry.artImage}
                      />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className={cx(styles.panel, styles.earsPanel)}>
            <ReturnButton
              arrowClassName={styles.arrowLeft}
              className={styles.returnFromEars}
              label="Return from ears area"
              onClick={() => moveToPanel("home")}
            />
          </div>
          <div className={cx(styles.panel, styles.systemsPanel)}>
            <ReturnButton
              arrowClassName={styles.arrowUp}
              className={styles.returnFromSystems}
              label="Return to area page"
              onClick={() =>
                returnToAreaHome(reducedMotionRef.current ? "auto" : "smooth")
              }
            />
          </div>
        </div>
      </div>
      {activePanel !== "home" ? (
        <button
          aria-label="Return to Current Zeng landing page"
          className={styles.czReturnButton}
          onClick={handleCzReturnClick}
          type="button"
        >
          <Image alt="" fill sizes="clamp(5rem, 11vw, 9rem)" src={czMark} />
        </button>
      ) : null}
    </div>
  );
}
