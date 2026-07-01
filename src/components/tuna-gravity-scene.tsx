"use client";

import asset1 from "../../assets/tuna/Asset 1.svg";
import asset2 from "../../assets/tuna/Asset 2.svg";
import asset3 from "../../assets/tuna/Asset 3.svg";
import asset4 from "../../assets/tuna/Asset 4.svg";
import asset5 from "../../assets/tuna/Asset 5.svg";
import asset6 from "../../assets/tuna/Asset 6.svg";
import {
  PhysicsArtworkScene,
  type PhysicsArtworkItem,
} from "@/components/physics-artwork-scene";

const tunaGravity = { x: 0, y: 3 };

const tunaItems: readonly PhysicsArtworkItem[] = [
  {
    id: "asset-1",
    image: asset1,
    aspectRatio: "767.57 / 199.61",
    desktop: { x: "19%", y: "8%", width: "27%", angle: -4 },
    phone: { x: "48%", y: "8%", width: "72%", angle: -4 },
    static: {
      desktop: { x: "22%", y: "17%" },
      phone: { x: "50%", y: "10%" },
    },
  },
  {
    id: "asset-2",
    image: asset2,
    aspectRatio: "555.83 / 627.25",
    desktop: { x: "44%", y: "10%", width: "12%", angle: 5 },
    phone: { x: "22%", y: "23%", width: "34%", angle: 5 },
    static: {
      desktop: { x: "49%", y: "17%" },
      phone: { x: "22%", y: "31%" },
    },
  },
  {
    id: "asset-3",
    image: asset3,
    aspectRatio: "709.05 / 495.1",
    desktop: { x: "64%", y: "9%", width: "17%", angle: -6 },
    phone: { x: "70%", y: "25%", width: "44%", angle: -6 },
    static: {
      desktop: { x: "76%", y: "17%" },
      phone: { x: "70%", y: "31%" },
    },
  },
  {
    id: "asset-4",
    image: asset4,
    aspectRatio: "771.97 / 379.97",
    desktop: { x: "21%", y: "30%", width: "20%", angle: 4 },
    phone: { x: "47%", y: "43%", width: "56%", angle: 4 },
    static: {
      desktop: { x: "24%", y: "52%" },
      phone: { x: "50%", y: "50%" },
    },
  },
  {
    id: "asset-5",
    image: asset5,
    aspectRatio: "966.33 / 611.25",
    desktop: { x: "51%", y: "31%", width: "22%", angle: -3 },
    phone: { x: "32%", y: "61%", width: "56%", angle: -3 },
    static: {
      desktop: { x: "51%", y: "52%" },
      phone: { x: "33%", y: "72%" },
    },
  },
  {
    id: "asset-6",
    image: asset6,
    aspectRatio: "892.32 / 625.25",
    desktop: { x: "78%", y: "31%", width: "19%", angle: 6 },
    phone: { x: "73%", y: "64%", width: "50%", angle: 6 },
    static: {
      desktop: { x: "77%", y: "52%" },
      phone: { x: "73%", y: "72%" },
    },
  },
];

export function TunaGravityScene() {
  return (
    <PhysicsArtworkScene
      gravity={tunaGravity}
      items={tunaItems}
      sceneId="tuna"
    />
  );
}
