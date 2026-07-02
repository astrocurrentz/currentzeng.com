"use client";

import Image from "next/image";
import { type MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import baziIcon from "../../assets/codes/bazi icon.png";
import baziPhone from "../../assets/codes/bazi phone.png";
import reCrest from "../../assets/codes/re crest.svg";
import reLaptop from "../../assets/codes/re laptop.png";
import { designTokens } from "@/config/design-tokens";
import { BaziOverlayPage } from "@/components/selected-works/BaziOverlayPage";
import { cx } from "@/lib/class-names";
import styles from "./systems-showcase.module.css";

type SystemsShowcaseProps = {
  isActive: boolean;
};

type PressedTarget = "bazi-phone" | "bazi-icon" | "re-laptop" | "re-crest";

const reindeerUrl = "https://www.reindeereducation.com/";
const pressReleaseMs = designTokens.components.areaSection.pressReleaseMs;
const linkDelayMs = designTokens.components.areaSection.pressScrollDelayMs;
const newTabFeatures = "noopener,noreferrer";

function isModifiedClick(event: MouseEvent<HTMLAnchorElement>) {
  return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
}

export function SystemsShowcase({ isActive }: SystemsShowcaseProps) {
  const pressTimeoutRef = useRef<number | null>(null);
  const navTimeoutRef = useRef<number | null>(null);
  const baziOverlayTimeoutRef = useRef<number | null>(null);
  const [pressedTarget, setPressedTarget] = useState<PressedTarget | null>(null);
  const [isBaziOverlayOpen, setIsBaziOverlayOpen] = useState(false);

  const releasePressedTarget = useCallback(() => {
    if (pressTimeoutRef.current !== null) {
      window.clearTimeout(pressTimeoutRef.current);
    }

    pressTimeoutRef.current = window.setTimeout(() => {
      setPressedTarget(null);
      pressTimeoutRef.current = null;
    }, pressReleaseMs);
  }, []);

  const pressTarget = useCallback(
    (target: PressedTarget) => {
      setPressedTarget(target);
      releasePressedTarget();
    },
    [releasePressedTarget],
  );

  const navigateToReindeer = useCallback(
    (
      target: Extract<PressedTarget, "re-laptop" | "re-crest">,
      openInNewTab = false,
    ) =>
      (event: MouseEvent<HTMLAnchorElement>) => {
        if (isModifiedClick(event)) {
          return;
        }

        event.preventDefault();
        pressTarget(target);

        if (openInNewTab) {
          window.open(reindeerUrl, "_blank", newTabFeatures);
          return;
        }

        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;

        if (navTimeoutRef.current !== null) {
          window.clearTimeout(navTimeoutRef.current);
        }

        navTimeoutRef.current = window.setTimeout(
          () => {
            window.location.href = reindeerUrl;
          },
          prefersReducedMotion ? 0 : linkDelayMs,
        );
      },
    [pressTarget],
  );

  const openBaziOverlay = useCallback(
    (target: Extract<PressedTarget, "bazi-phone" | "bazi-icon">) => {
      pressTarget(target);

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (baziOverlayTimeoutRef.current !== null) {
        window.clearTimeout(baziOverlayTimeoutRef.current);
      }

      baziOverlayTimeoutRef.current = window.setTimeout(
        () => {
          setIsBaziOverlayOpen(true);
          baziOverlayTimeoutRef.current = null;
        },
        prefersReducedMotion ? 0 : linkDelayMs,
      );
    },
    [pressTarget],
  );

  useEffect(() => {
    return () => {
      if (pressTimeoutRef.current !== null) {
        window.clearTimeout(pressTimeoutRef.current);
      }

      if (navTimeoutRef.current !== null) {
        window.clearTimeout(navTimeoutRef.current);
      }

      if (baziOverlayTimeoutRef.current !== null) {
        window.clearTimeout(baziOverlayTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isActive || !isBaziOverlayOpen) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setIsBaziOverlayOpen(false);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isActive, isBaziOverlayOpen]);

  useEffect(() => {
    if (!isBaziOverlayOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsBaziOverlayOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isBaziOverlayOpen]);

  return (
    <section
      aria-hidden={isActive ? undefined : true}
      aria-labelledby="systems-codes-title"
      className={cx(
        styles.systemsShowcase,
        isBaziOverlayOpen && styles.hasOverlay,
      )}
      inert={isActive ? undefined : true}
    >
      <div
        aria-hidden={isBaziOverlayOpen ? true : undefined}
        className={styles.artboard}
        inert={isBaziOverlayOpen ? true : undefined}
      >
        <button
          aria-label="BaZi Atlas app preview"
          className={cx(
            styles.deviceAction,
            styles.baziPhone,
            pressedTarget === "bazi-phone" && styles.isPressed,
          )}
          onClick={() => openBaziOverlay("bazi-phone")}
          type="button"
        >
          <span className={styles.deviceArtwork}>
            <Image
              alt=""
              fill
              sizes="(max-width: 767px) 44vw, 11vw"
              src={baziPhone}
            />
          </span>
        </button>

        <a
          aria-label="Visit Reindeer Education"
          className={cx(
            styles.deviceAction,
            styles.reLaptop,
            pressedTarget === "re-laptop" && styles.isPressed,
          )}
          href={reindeerUrl}
          onClick={navigateToReindeer("re-laptop", true)}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span className={styles.deviceArtwork}>
            <Image
              alt=""
              fill
              sizes="(max-width: 767px) 82vw, 29vw"
              src={reLaptop}
            />
          </span>
        </a>

        <p className={cx(styles.projectCopy, styles.baziCopy)}>
          <span className={styles.projectKicker}>iOS App</span>
          <span className={styles.projectName}>Neobrutalism BaZi Atlas</span>
        </p>

        <p className={cx(styles.projectCopy, styles.reCopy)}>
          <span className={styles.projectKicker}>education institute</span>
          <span className={styles.projectName}>
            branding &amp; official website
          </span>
        </p>

        <button
          aria-label="BaZi Atlas app icon"
          className={cx(
            styles.markButton,
            styles.baziIcon,
            pressedTarget === "bazi-icon" && styles.isPressed,
          )}
          onClick={() => openBaziOverlay("bazi-icon")}
          type="button"
        >
          <span className={styles.markArtwork}>
            <Image
              alt=""
              fill
              sizes="(max-width: 767px) 18vw, 5vw"
              src={baziIcon}
            />
          </span>
        </button>

        <a
          aria-label="Visit Reindeer Education"
          className={cx(
            styles.markButton,
            styles.reCrest,
            pressedTarget === "re-crest" && styles.isPressed,
          )}
          href={reindeerUrl}
          onClick={navigateToReindeer("re-crest", true)}
          rel="noopener noreferrer"
          target="_blank"
        >
          <span className={styles.markArtwork}>
            <Image
              alt=""
              fill
              sizes="(max-width: 767px) 18vw, 5vw"
              src={reCrest}
              unoptimized
            />
          </span>
        </a>

        <h2 className={styles.title} id="systems-codes-title">
          codes
        </h2>
      </div>

      {isBaziOverlayOpen ? (
        <div
          aria-label="BaZi Atlas app demo"
          aria-modal="true"
          className={styles.baziOverlay}
          data-systems-scroll-contained="true"
          role="dialog"
        >
          <BaziOverlayPage onClose={() => setIsBaziOverlayOpen(false)} />
        </div>
      ) : null}
    </section>
  );
}
