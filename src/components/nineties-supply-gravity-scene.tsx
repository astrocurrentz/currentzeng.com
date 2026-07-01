"use client";

import asset3 from "../../assets/90 supply/SVG/Asset 3.svg";
import asset4 from "../../assets/90 supply/SVG/Asset 4.svg";
import asset5 from "../../assets/90 supply/SVG/Asset 5.svg";
import asset6 from "../../assets/90 supply/SVG/Asset 6.svg";
import asset7 from "../../assets/90 supply/SVG/Asset 7.svg";
import asset8 from "../../assets/90 supply/SVG/Asset 8.svg";
import asset10 from "../../assets/90 supply/SVG/Asset 10.svg";
import asset11 from "../../assets/90 supply/SVG/Asset 11.svg";
import {
  PhysicsArtworkScene,
  type PhysicsArtworkCollisionIsland,
  type PhysicsArtworkItem,
} from "@/components/physics-artwork-scene";
import { NinetiesSupplyBoxCarousel } from "@/components/nineties-supply-box-carousel";
import styles from "./nineties-supply-gravity-scene.module.css";

const ninetiesSupplyGravity = { x: 0, y: 3 };
const leftSpawnLane = { desktop: "34%", phone: "24%" } as const;
const rightSpawnLane = { desktop: "66%", phone: "76%" } as const;

const ninetiesSupplyCollisionIslands: readonly PhysicsArtworkCollisionIsland[] =
  [
    {
      id: "carousel",
      aspectRatio: "5 / 4",
      collisionTargetSelector:
        "[data-nineties-supply-collision-target]",
      desktop: {
        x: "50%",
        y: "38%",
        width: "var(--nineties-supply-carousel-width)",
      },
      phone: {
        x: "50%",
        y: "37%",
        width: "var(--nineties-supply-carousel-width)",
      },
    },
  ];

const ninetiesSupplyItems: readonly PhysicsArtworkItem[] = [
  {
    id: "asset-3",
    image: asset3,
    aspectRatio: "1508.97 / 125.13",
    desktop: { x: leftSpawnLane.desktop, y: "8%", width: "24%", angle: -3 },
    phone: { x: leftSpawnLane.phone, y: "48%", width: "70%", angle: -3 },
    static: {
      desktop: { x: "20%", y: "15%" },
      phone: { x: "50%", y: "9%" },
    },
  },
  {
    id: "asset-4",
    image: asset4,
    aspectRatio: "1508.97 / 125.13",
    desktop: { x: rightSpawnLane.desktop, y: "12%", width: "24%", angle: 4 },
    phone: { x: rightSpawnLane.phone, y: "48%", width: "70%", angle: 4 },
    static: {
      desktop: { x: "50%", y: "15%" },
      phone: { x: "50%", y: "21%" },
    },
  },
  {
    id: "asset-5",
    image: asset5,
    aspectRatio: "753.14 / 301.17",
    desktop: { x: leftSpawnLane.desktop, y: "8%", width: "16%", angle: -5 },
    phone: { x: leftSpawnLane.phone, y: "56%", width: "48%", angle: -5 },
    static: {
      desktop: { x: "82%", y: "15%" },
      phone: { x: "27%", y: "35%" },
    },
  },
  {
    id: "asset-6",
    image: asset6,
    aspectRatio: "753.14 / 301.17",
    desktop: { x: rightSpawnLane.desktop, y: "18%", width: "16%", angle: 4 },
    phone: { x: rightSpawnLane.phone, y: "56%", width: "48%", angle: 4 },
    static: {
      desktop: { x: "18%", y: "47%" },
      phone: { x: "73%", y: "36%" },
    },
  },
  {
    id: "asset-7",
    image: asset7,
    aspectRatio: "753.14 / 301.17",
    desktop: { x: leftSpawnLane.desktop, y: "28%", width: "16%", angle: -4 },
    phone: { x: leftSpawnLane.phone, y: "64%", width: "48%", angle: -4 },
    static: {
      desktop: { x: "48%", y: "47%" },
      phone: { x: "50%", y: "49%" },
    },
  },
  {
    id: "asset-8",
    image: asset8,
    aspectRatio: "580.1 / 466.64",
    desktop: { x: rightSpawnLane.desktop, y: "30%", width: "11%", angle: 5 },
    phone: { x: rightSpawnLane.phone, y: "64%", width: "28%", angle: 5 },
    static: {
      desktop: { x: "78%", y: "47%" },
      phone: { x: "18%", y: "66%" },
    },
  },
  {
    id: "asset-10",
    image: asset10,
    aspectRatio: "580.1 / 466.64",
    desktop: { x: leftSpawnLane.desktop, y: "34%", width: "11%", angle: 4 },
    phone: { x: leftSpawnLane.phone, y: "72%", width: "30%", angle: 4 },
    static: {
      desktop: { x: "35%", y: "78%" },
      phone: { x: "75%", y: "66%" },
    },
  },
  {
    id: "asset-11",
    image: asset11,
    aspectRatio: "577.79 / 464.78",
    desktop: { x: rightSpawnLane.desktop, y: "45%", width: "11%", angle: -3 },
    phone: { x: rightSpawnLane.phone, y: "72%", width: "32%", angle: -3 },
    static: {
      desktop: { x: "68%", y: "78%" },
      phone: { x: "50%", y: "84%" },
    },
  },
];

export function NinetiesSupplyGravityScene() {
  return (
    <div className={styles.composition}>
      <PhysicsArtworkScene
        collisionIslands={ninetiesSupplyCollisionIslands}
        gravity={ninetiesSupplyGravity}
        items={ninetiesSupplyItems}
        sceneId="nineties-supply"
      />
      <NinetiesSupplyBoxCarousel
        attentionHintKey="nineties-supply-panel-load"
      />
    </div>
  );
}
