"use client";

import { useSpring } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
import {
  type CSSProperties,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cx } from "@/lib/class-names";
import styles from "./freewill-panel.module.css";

type FreewillPan = {
  x: number;
  y: number;
};

type FreewillDisplayScale = {
  width: number;
  height: number;
};

type FreewillAsset = {
  displayScale?: FreewillDisplayScale;
  href?: string;
  label: string;
  src: string;
  wipSrc?: string;
  wipTitle?: string;
};

type FreewillTile = {
  asset: FreewillAsset;
  key: string;
  x: number;
  y: number;
};

type FreewillWipPopup = {
  src: string;
  title: string;
};

type PanelSize = {
  width: number;
  height: number;
};

const spotifyArtistUrl =
  "https://open.spotify.com/artist/3xREYHFthr71ZxpGbbo20n?si=-o78G5STSHqfA4MRNegayw";
const spotifyRingUrl =
  "https://open.spotify.com/track/68soMWMZ84dkWc6udaqORQ?si=34ef287da1a142d4";
const svgScale = 0.54;
const defaultDisplayScale = { width: svgScale, height: svgScale } as const;
const wordmarkDisplayScale = { width: 1.18, height: 0.376 } as const;
const tileBufferSteps = 2;
const assetStrideX = 5;
const assetStrideY = 3;
const clickMoveThresholdPx = 8;
const signalPopDurationMs = 540;
const initialPan = { x: -76, y: 0 } as const;
const fallbackPanelSize = { width: 1280, height: 720 } as const;

const freewillAssets: readonly FreewillAsset[] = [
  {
    label: "Angle",
    src: "/assets/freewill/angle.svg",
    wipSrc: "/assets/freewill/angle_.svg",
    wipTitle: "Angels Are Alien Drones",
  },
  {
    label: "Eye",
    src: "/assets/freewill/eye.svg",
    wipSrc: "/assets/freewill/eye_.svg",
    wipTitle: "xxx protocol",
  },
  {
    displayScale: wordmarkDisplayScale,
    href: spotifyArtistUrl,
    label: "Freewill",
    src: "/assets/freewill/freewill.svg",
  },
  {
    label: "Hand",
    src: "/assets/freewill/hand.svg",
    wipSrc: "/assets/freewill/hand_.svg",
    wipTitle: "Kill Ill Will",
  },
  {
    href: spotifyArtistUrl,
    label: "Head and dot",
    src: "/assets/freewill/head-and-dot.svg",
  },
  {
    label: "Head",
    src: "/assets/freewill/head.svg",
  },
  {
    label: "Jar",
    src: "/assets/freewill/jar.svg",
    wipSrc: "/assets/freewill/jar_.svg",
    wipTitle: "Sunday",
  },
  {
    label: "Lightning",
    src: "/assets/freewill/lightning.svg",
  },
  {
    label: "One",
    src: "/assets/freewill/one.svg",
    wipSrc: "/assets/freewill/one_.svg",
    wipTitle: "One",
  },
  {
    href: spotifyRingUrl,
    label: "Ring",
    src: "/assets/freewill/ring.svg",
  },
  {
    label: "Scent",
    src: "/assets/freewill/scent.svg",
    wipSrc: "/assets/freewill/scent_.svg",
    wipTitle: "Extraterrestrial Scents",
  },
  {
    label: "Upload",
    src: "/assets/freewill/upload.svg",
    wipSrc: "/assets/freewill/upload_.svg",
    wipTitle: "Will U Upload",
  },
  {
    label: "Water",
    src: "/assets/freewill/water.svg",
    wipSrc: "/assets/freewill/water_.svg",
    wipTitle: "Shui",
  },
  {
    label: "Wuxing",
    src: "/assets/freewill/wuxing.svg",
    wipSrc: "/assets/freewill/wuxing_.svg",
    wipTitle: "Wuxing",
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function positiveModulo(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

function usePanelSize(elementRef: RefObject<HTMLElement | null>) {
  const [panelSize, setPanelSize] = useState<PanelSize>(fallbackPanelSize);

  useEffect(() => {
    const element = elementRef.current;

    if (element === null) {
      return;
    }

    const syncSize = () => {
      const rect = element.getBoundingClientRect();

      setPanelSize({
        height: Math.max(1, Math.round(rect.height)),
        width: Math.max(1, Math.round(rect.width)),
      });
    };

    syncSize();

    const resizeObserver = new ResizeObserver(syncSize);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [elementRef]);

  return panelSize;
}

export function FreewillPanel() {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const animationTimeoutsRef = useRef<Map<string, number>>(new Map());
  const suppressNextTileClickRef = useRef(false);
  const viewport = usePanelSize(shellRef);
  const viewportRef = useRef(viewport);
  const panRef = useRef<FreewillPan>(initialPan);
  const [pan, setPan] = useState<FreewillPan>(initialPan);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTileAnimations, setActiveTileAnimations] = useState<
    Record<string, number>
  >({});
  const [wipPopup, setWipPopup] = useState<FreewillWipPopup | null>(null);

  const syncPanSnapshot = useCallback((nextPan: FreewillPan) => {
    panRef.current = nextPan;
    setPan(nextPan);
  }, []);

  const [, panApi] = useSpring<FreewillPan>(
    () => ({
      x: initialPan.x,
      y: initialPan.y,
      onChange: ({ value }) => {
        syncPanSnapshot({
          x: value.x,
          y: value.y,
        });
      },
    }),
    [syncPanSnapshot],
  );

  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  useEffect(
    () => () => {
      animationTimeoutsRef.current.forEach((timeoutId) =>
        window.clearTimeout(timeoutId),
      );
      animationTimeoutsRef.current.clear();
    },
    [],
  );

  const tileMetrics = useMemo(() => {
    const shortestSide = Math.min(viewport.width, viewport.height);
    const tileSize =
      viewport.width < 640
        ? clamp(viewport.width * 0.34, 116, 152)
        : clamp(shortestSide * 0.28, 156, 236);
    const gap = clamp(tileSize * 0.38, 42, 92);

    return {
      step: Math.round(tileSize + gap),
      tileSize: Math.round(tileSize),
    };
  }, [viewport.height, viewport.width]);

  const tiles = useMemo<FreewillTile[]>(() => {
    const { step } = tileMetrics;
    const halfWidth = viewport.width / 2;
    const halfHeight = viewport.height / 2;
    const buffer = step * tileBufferSteps;
    const minCol = Math.floor((pan.x - halfWidth - buffer) / step);
    const maxCol = Math.ceil((pan.x + halfWidth + buffer) / step);
    const minRow = Math.floor((pan.y - halfHeight - buffer) / step);
    const maxRow = Math.ceil((pan.y + halfHeight + buffer) / step);
    const nextTiles: FreewillTile[] = [];

    for (let row = minRow; row <= maxRow; row += 1) {
      for (let col = minCol; col <= maxCol; col += 1) {
        const assetIndex = positiveModulo(
          col * assetStrideX + row * assetStrideY,
          freewillAssets.length,
        );
        const asset = freewillAssets[assetIndex];

        if (asset === undefined) {
          continue;
        }

        nextTiles.push({
          asset,
          key: `${col}:${row}`,
          x: halfWidth + col * step - pan.x,
          y: halfHeight + row * step - pan.y,
        });
      }
    }

    return nextTiles;
  }, [pan.x, pan.y, tileMetrics, viewport.height, viewport.width]);

  useEffect(() => {
    const shell = shellRef.current;

    if (shell === null) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      panApi.stop();

      const deltaScale =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? Math.max(viewportRef.current.width, viewportRef.current.height)
            : 1;
      const nextPan = {
        x: panRef.current.x + event.deltaX * deltaScale,
        y: panRef.current.y + event.deltaY * deltaScale,
      };

      syncPanSnapshot(nextPan);
      panApi.start({
        ...nextPan,
        immediate: true,
      });
    };

    shell.addEventListener("wheel", handleWheel, { passive: false });

    return () => shell.removeEventListener("wheel", handleWheel);
  }, [panApi, syncPanSnapshot]);

  const triggerTileActivation = useCallback(
    (
      tileKey: string,
      href: string | null,
      nextWipPopup: FreewillWipPopup | null,
    ) => {
      const animationId = Date.now();
      const existingTimeoutId = animationTimeoutsRef.current.get(tileKey);

      if (existingTimeoutId !== undefined) {
        window.clearTimeout(existingTimeoutId);
      }

      setActiveTileAnimations((currentAnimations) => ({
        ...currentAnimations,
        [tileKey]: animationId,
      }));

      if (href !== null) {
        window.open(href, "_blank", "noopener,noreferrer");
      }

      if (nextWipPopup !== null) {
        setWipPopup(nextWipPopup);
      }

      const timeoutId = window.setTimeout(() => {
        animationTimeoutsRef.current.delete(tileKey);
        setActiveTileAnimations((currentAnimations) => {
          if (currentAnimations[tileKey] !== animationId) {
            return currentAnimations;
          }

          const nextAnimations = { ...currentAnimations };
          delete nextAnimations[tileKey];
          return nextAnimations;
        });
      }, signalPopDurationMs);

      animationTimeoutsRef.current.set(tileKey, timeoutId);
    },
    [],
  );

  useDrag(
    ({
      cancel,
      delta: [deltaX, deltaY],
      direction: [directionX, directionY],
      event,
      first,
      last,
      movement: [movementX, movementY],
      velocity: [velocityX, velocityY],
    }) => {
      const targetElement = event.target instanceof Element ? event.target : null;

      if (targetElement?.closest('[data-freewill-control="true"]')) {
        cancel();
        setIsDragging(false);
        return;
      }

      if (
        Math.hypot(movementX, movementY) > clickMoveThresholdPx &&
        event.cancelable
      ) {
        event.preventDefault();
      }

      if (first) {
        suppressNextTileClickRef.current = false;
        panApi.stop();
        setIsDragging(true);
      }

      if (deltaX !== 0 || deltaY !== 0) {
        const nextPan = {
          x: panRef.current.x - deltaX,
          y: panRef.current.y - deltaY,
        };

        syncPanSnapshot(nextPan);
        panApi.start({
          ...nextPan,
          immediate: true,
        });
      }

      if (!last) {
        return;
      }

      setIsDragging(false);

      const didDrag =
        Math.hypot(movementX, movementY) > clickMoveThresholdPx;
      suppressNextTileClickRef.current = didDrag;

      if (didDrag) {
        window.setTimeout(() => {
          suppressNextTileClickRef.current = false;
        }, 80);
      }

      const panVelocityX = -velocityX * directionX;
      const panVelocityY = -velocityY * directionY;

      if (!didDrag || Math.hypot(panVelocityX, panVelocityY) <= 0.01) {
        return;
      }

      panApi.start({
        x: panRef.current.x,
        y: panRef.current.y,
        immediate: false,
        config: (key) => ({
          decay: true,
          velocity: key === "x" ? panVelocityX : panVelocityY,
        }),
      });
    },
    {
      eventOptions: { passive: false },
      pointer: {
        buttons: 1,
        keys: false,
      },
      target: shellRef,
    },
  );

  return (
    <div
      aria-label="The Freewill infinite artwork grid"
      className={cx(styles.panel, isDragging && styles.isDragging)}
      data-freewill-panel=""
      onDragStart={(event) => event.preventDefault()}
      ref={shellRef}
      role="application"
    >
      <div aria-hidden="true" className={styles.tileLayer}>
        {tiles.map((tile) => {
          const displayScale = tile.asset.displayScale ?? defaultDisplayScale;
          const tileWipPopup =
            tile.asset.wipTitle !== undefined && tile.asset.wipSrc !== undefined
              ? { src: tile.asset.wipSrc, title: tile.asset.wipTitle }
              : null;
          const tileStyle: CSSProperties = {
            height: tileMetrics.tileSize,
            transform: `translate3d(${(
              tile.x -
              tileMetrics.tileSize / 2
            ).toFixed(2)}px, ${(
              tile.y -
              tileMetrics.tileSize / 2
            ).toFixed(2)}px, 0)`,
            width: tileMetrics.tileSize,
          };
          const hitTargetStyle: CSSProperties = {
            height: `${displayScale.height * 100}%`,
            width: `${displayScale.width * 100}%`,
          };

          return (
            <div
              className={cx(
                styles.tile,
                activeTileAnimations[tile.key] !== undefined &&
                  styles.signalPopActive,
              )}
              data-freewill-asset={tile.asset.label}
              key={tile.key}
              style={tileStyle}
            >
              <span
                className={styles.hitTarget}
                data-freewill-href={tile.asset.href}
                data-freewill-tile-key={tile.key}
                data-freewill-wip-src={tile.asset.wipSrc}
                data-freewill-wip-title={tile.asset.wipTitle}
                onClick={(event) => {
                  event.stopPropagation();

                  if (suppressNextTileClickRef.current) {
                    suppressNextTileClickRef.current = false;
                    return;
                  }

                  triggerTileActivation(
                    tile.key,
                    tile.asset.href ?? null,
                    tileWipPopup,
                  );
                }}
                style={hitTargetStyle}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- Native SVG img preserves the migrated grid sizing and drag behavior. */}
                <img
                  alt=""
                  className={styles.image}
                  draggable={false}
                  key={`${tile.key}-${
                    activeTileAnimations[tile.key] ?? "idle"
                  }`}
                  src={tile.asset.src}
                />
              </span>
            </div>
          );
        })}
      </div>

      {wipPopup === null ? null : (
        <button
          aria-label={`Close ${wipPopup.title} WIP popup`}
          className={styles.wipOverlay}
          data-freewill-control="true"
          onClick={(event) => {
            event.stopPropagation();
            setWipPopup(null);
          }}
          onPointerDown={(event) => event.stopPropagation()}
          type="button"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- Native SVG img preserves the migrated WIP popup artwork. */}
          <img
            alt={`${wipPopup.title} WIP`}
            className={styles.wipImage}
            draggable={false}
            src={wipPopup.src}
          />
        </button>
      )}
    </div>
  );
}
