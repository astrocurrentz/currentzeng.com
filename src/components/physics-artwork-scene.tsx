"use client";

import type Matter from "matter-js";
import Image, { type StaticImageData } from "next/image";
import {
  type CSSProperties,
  useEffect,
  useMemo,
  useState,
} from "react";
import Gravity, {
  MatterBody,
} from "@/components/fancy/physics/gravity";
import styles from "./physics-artwork-scene.module.css";

type Percentage = `${number}%`;

export type PhysicsArtworkPlacement = {
  x: Percentage;
  y: Percentage;
  width: Percentage;
  angle: number;
};

export type PhysicsArtworkStaticPlacement = {
  x: Percentage;
  y: Percentage;
};

export type PhysicsArtworkCollisionIsland = {
  id: string;
  aspectRatio: string;
  collisionTargetSelector?: string;
  desktop: {
    x: Percentage;
    y: Percentage;
    width: string;
  };
  phone?: {
    x: Percentage;
    y: Percentage;
    width: string;
  };
};

type PhysicsArtworkAlphaCrop = {
  canvas: {
    width: number;
    height: number;
  };
  crop: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export type PhysicsArtworkItem = {
  id: string;
  image: StaticImageData;
  aspectRatio: string;
  artwork?: {
    alphaCrop?: PhysicsArtworkAlphaCrop;
    renderMode?: "image" | "mask";
  };
  bodyType?: "circle" | "rectangle";
  desktop: PhysicsArtworkPlacement;
  phone?: PhysicsArtworkPlacement;
  static: {
    desktop: PhysicsArtworkStaticPlacement;
    phone?: PhysicsArtworkStaticPlacement;
  };
};

type PhysicsArtworkSceneProps = {
  sceneId: string;
  items: readonly PhysicsArtworkItem[];
  gravity: { x: number; y: number };
  bodyOptions?: Matter.IBodyDefinition;
  collisionIslands?: readonly PhysicsArtworkCollisionIsland[];
  onSettled?: () => void;
  palette?: readonly string[];
};

type SceneObjectStyle = CSSProperties & {
  "--scene-object-aspect-ratio": string;
  "--scene-object-width": Percentage;
};

type StaticSceneObjectStyle = SceneObjectStyle & {
  "--scene-object-angle": string;
  "--scene-object-left": Percentage;
  "--scene-object-top": Percentage;
};

type AlphaCropStyle = CSSProperties & {
  "--artwork-canvas-height": string;
  "--artwork-canvas-left": string;
  "--artwork-canvas-top": string;
  "--artwork-canvas-width": string;
};

type MaskArtworkStyle = CSSProperties & {
  "--artwork-mask-color": string;
  "--artwork-mask-image": string;
};

type CollisionIslandStyle = CSSProperties & {
  "--scene-collision-island-aspect-ratio": string;
  "--scene-collision-island-width": string;
};

const portraitPhoneQuery = "(max-width: 767px) and (orientation: portrait)";
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

const defaultBodyOptions: Matter.IBodyDefinition = {
  density: 0.0012,
  friction: 0.48,
  frictionAir: 0.012,
  restitution: 0.24,
};

const collisionIslandBodyOptions: Matter.IBodyDefinition = {
  friction: 0.82,
  isStatic: true,
  restitution: 0.2,
};
const noCollisionIslands: readonly PhysicsArtworkCollisionIsland[] = [];

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const syncMatch = () => setMatches(mediaQuery.matches);

    syncMatch();
    mediaQuery.addEventListener("change", syncMatch);

    return () => mediaQuery.removeEventListener("change", syncMatch);
  }, [query]);

  return matches;
}

function getObjectStyle(
  item: PhysicsArtworkItem,
  placement: PhysicsArtworkPlacement,
): SceneObjectStyle {
  return {
    "--scene-object-aspect-ratio": item.aspectRatio,
    "--scene-object-width": placement.width,
  };
}

function getCollisionIslandStyle(
  island: PhysicsArtworkCollisionIsland,
  width: string,
): CollisionIslandStyle {
  return {
    "--scene-collision-island-aspect-ratio": island.aspectRatio,
    "--scene-collision-island-width": width,
  };
}

function createPaletteSeed() {
  if (typeof window !== "undefined" && window.crypto !== undefined) {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);

    return values[0] ?? 1;
  }

  return Math.floor(Math.random() * 0xffffffff);
}

function getSeededRandom(seed: number) {
  let value = seed >>> 0;

  return () => {
    value += 0x6d2b79f5;

    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);

    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithSeed<T>(values: readonly T[], seed: number) {
  const shuffled = [...values];
  const random = getSeededRandom(seed);

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function getPaletteAssignments(
  items: readonly PhysicsArtworkItem[],
  palette: readonly string[] | undefined,
  seed: number,
) {
  if (palette === undefined || palette.length === 0) {
    return new Map<string, string>();
  }

  const colors = items.map((_, index) => palette[index % palette.length]);
  const shuffledColors = shuffleWithSeed(colors, seed);

  return new Map(
    items.map((item, index) => [item.id, shuffledColors[index] ?? palette[0]]),
  );
}

function getAlphaCropStyle(alphaCrop: PhysicsArtworkAlphaCrop): AlphaCropStyle {
  return {
    "--artwork-canvas-height": `${
      (alphaCrop.canvas.height / alphaCrop.crop.height) * 100
    }%`,
    "--artwork-canvas-left": `${
      -(alphaCrop.crop.x / alphaCrop.crop.width) * 100
    }%`,
    "--artwork-canvas-top": `${
      -(alphaCrop.crop.y / alphaCrop.crop.height) * 100
    }%`,
    "--artwork-canvas-width": `${
      (alphaCrop.canvas.width / alphaCrop.crop.width) * 100
    }%`,
  };
}

function SceneArtwork({
  color,
  item,
}: {
  color?: string;
  item: PhysicsArtworkItem;
}) {
  if (item.artwork?.renderMode === "mask") {
    const maskStyle: MaskArtworkStyle = {
      "--artwork-mask-color": color ?? "currentColor",
      "--artwork-mask-image": `url("${item.image.src}")`,
    };

    return (
      <span
        className={styles.maskArtwork}
        data-artwork-render-mode="mask"
        style={maskStyle}
      />
    );
  }

  const image = (
    <Image
      alt=""
      className={styles.objectImage}
      draggable={false}
      fill
      sizes="(max-width: 767px) 68vw, 25vw"
      src={item.image}
    />
  );

  if (item.artwork?.alphaCrop === undefined) {
    return image;
  }

  return (
    <span
      className={styles.alphaCropArtwork}
      data-artwork-alpha-crop=""
      style={getAlphaCropStyle(item.artwork.alphaCrop)}
    >
      {image}
    </span>
  );
}

export function PhysicsArtworkScene({
  bodyOptions = defaultBodyOptions,
  collisionIslands = noCollisionIslands,
  gravity,
  items,
  onSettled,
  palette,
  sceneId,
}: PhysicsArtworkSceneProps) {
  const isPortraitPhone = useMediaQuery(portraitPhoneQuery);
  const [paletteSeed] = useState(createPaletteSeed);
  const prefersReducedMotion = useMediaQuery(reducedMotionQuery);
  const activeItems = useMemo(
    () =>
      isPortraitPhone
        ? items.filter((item) => item.phone !== undefined)
        : items,
    [isPortraitPhone, items],
  );
  const activeCollisionIslands = useMemo(
    () =>
      isPortraitPhone
        ? collisionIslands.filter((island) => island.phone !== undefined)
        : collisionIslands,
    [collisionIslands, isPortraitPhone],
  );
  const paletteAssignments = useMemo(
    () => getPaletteAssignments(activeItems, palette, paletteSeed),
    [activeItems, palette, paletteSeed],
  );

  if (prefersReducedMotion) {
    return (
      <div
        aria-hidden="true"
        className={styles.scene}
        data-physics-mode="static"
        data-physics-scene={sceneId}
      >
        {activeItems.map((item) => {
          const placement =
            isPortraitPhone && item.phone !== undefined
              ? item.phone
              : item.desktop;
          const staticPlacement =
            isPortraitPhone && item.static.phone !== undefined
              ? item.static.phone
              : item.static.desktop;
          const objectStyle: StaticSceneObjectStyle = {
            ...getObjectStyle(item, placement),
            "--scene-object-angle": `${placement.angle}deg`,
            "--scene-object-left": staticPlacement.x,
            "--scene-object-top": staticPlacement.y,
          };

          return (
            <div
              className={styles.staticObject}
              data-physics-asset={item.id}
              key={item.id}
              style={objectStyle}
            >
              <SceneArtwork
                color={paletteAssignments.get(item.id)}
                item={item}
              />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={styles.scene}
      data-physics-mode="live"
      data-physics-scene={sceneId}
    >
      <Gravity
        className={styles.physicsStage}
        gravity={gravity}
        key={isPortraitPhone ? "phone" : "desktop"}
        onSettled={onSettled}
      >
        {activeCollisionIslands.map((island) => {
          const placement =
            isPortraitPhone && island.phone !== undefined
              ? island.phone
              : island.desktop;

          return (
            <MatterBody
              className={styles.collisionIsland}
              collisionTargetSelector={island.collisionTargetSelector}
              isDraggable={false}
              key={island.id}
              matterBodyOptions={collisionIslandBodyOptions}
              style={getCollisionIslandStyle(island, placement.width)}
              x={placement.x}
              y={placement.y}
            >
              <span data-physics-collision-island={island.id} />
            </MatterBody>
          );
        })}
        {activeItems.map((item) => {
          const placement =
            isPortraitPhone && item.phone !== undefined
              ? item.phone
              : item.desktop;

          return (
            <MatterBody
              angle={placement.angle}
              bodyType={item.bodyType ?? "rectangle"}
              className={styles.object}
              key={item.id}
              matterBodyOptions={bodyOptions}
              style={getObjectStyle(item, placement)}
              x={placement.x}
              y={placement.y}
            >
              <span
                className={styles.objectArtwork}
                data-physics-asset={item.id}
              >
                <SceneArtwork
                  color={paletteAssignments.get(item.id)}
                  item={item}
                />
              </span>
            </MatterBody>
          );
        })}
      </Gravity>
    </div>
  );
}
