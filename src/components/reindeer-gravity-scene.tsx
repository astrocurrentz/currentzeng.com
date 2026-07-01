"use client";

import asset32 from "../../assets/reindeer/Asset 32.svg";
import asset33 from "../../assets/reindeer/Asset 33.svg";
import asset34 from "../../assets/reindeer/Asset 34.svg";
import asset35 from "../../assets/reindeer/Asset 35.svg";
import asset36 from "../../assets/reindeer/Asset 36.svg";
import asset37 from "../../assets/reindeer/Asset 37.svg";
import asset38 from "../../assets/reindeer/Asset 38.svg";
import asset39 from "../../assets/reindeer/Asset 39.svg";
import asset40 from "../../assets/reindeer/Asset 40.svg";
import asset41 from "../../assets/reindeer/Asset 41.svg";
import asset42 from "../../assets/reindeer/Asset 42.svg";
import asset43 from "../../assets/reindeer/Asset 43.svg";
import asset44 from "../../assets/reindeer/Asset 44.svg";
import asset45 from "../../assets/reindeer/Asset 45.svg";
import asset46 from "../../assets/reindeer/Asset 46.svg";
import asset47 from "../../assets/reindeer/Asset 47.svg";
import asset48 from "../../assets/reindeer/Asset 48.svg";
import asset49 from "../../assets/reindeer/Asset 49.svg";
import asset50 from "../../assets/reindeer/Asset 50.svg";
import asset51 from "../../assets/reindeer/Asset 51.svg";
import asset52 from "../../assets/reindeer/Asset 52.svg";
import asset53 from "../../assets/reindeer/Asset 53.svg";
import asset54 from "../../assets/reindeer/Asset 54.svg";
import asset55 from "../../assets/reindeer/Asset 55.svg";
import {
  PhysicsArtworkScene,
  type PhysicsArtworkItem,
} from "@/components/physics-artwork-scene";

const reindeerGravity = { x: 0, y: 3 };
const reindeerArtwork = { renderMode: "mask" } as const;
const reindeerPalette = [
  "#005C42",
  "#E7F4E5",
  "#FFAD32",
  "#FFFFFF",
  "#000000",
] as const;

const reindeerItems: readonly PhysicsArtworkItem[] = [
  {
    id: "asset-32",
    image: asset32,
    aspectRatio: "250 / 239.87",
    artwork: reindeerArtwork,
    desktop: { x: "9%", y: "8%", width: "8%", angle: -7 },
    phone: { x: "21%", y: "7%", width: "24%", angle: -7 },
    static: {
      desktop: { x: "9%", y: "12%" },
      phone: { x: "20%", y: "11%" },
    },
  },
  {
    id: "asset-33",
    image: asset33,
    aspectRatio: "276.81 / 234.43",
    artwork: reindeerArtwork,
    desktop: { x: "24%", y: "7%", width: "9%", angle: 5 },
    phone: { x: "50%", y: "7%", width: "26%", angle: 5 },
    static: {
      desktop: { x: "25%", y: "12%" },
      phone: { x: "50%", y: "11%" },
    },
  },
  {
    id: "asset-34",
    image: asset34,
    aspectRatio: "240.2 / 239.87",
    artwork: reindeerArtwork,
    desktop: { x: "39%", y: "8%", width: "8%", angle: -5 },
    phone: { x: "80%", y: "7%", width: "24%", angle: -5 },
    static: {
      desktop: { x: "41%", y: "12%" },
      phone: { x: "80%", y: "11%" },
    },
  },
  {
    id: "asset-35",
    image: asset35,
    aspectRatio: "187.6 / 33.25",
    artwork: reindeerArtwork,
    desktop: { x: "57%", y: "8%", width: "14%", angle: 3 },
    phone: { x: "50%", y: "19%", width: "54%", angle: 3 },
    static: {
      desktop: { x: "58%", y: "12%" },
      phone: { x: "50%", y: "23%" },
    },
  },
  {
    id: "asset-36",
    image: asset36,
    aspectRatio: "43.08 / 41.88",
    artwork: reindeerArtwork,
    bodyType: "circle",
    desktop: { x: "75%", y: "9%", width: "4.5%", angle: -4 },
    phone: { x: "22%", y: "27%", width: "13%", angle: -4 },
    static: {
      desktop: { x: "76%", y: "12%" },
      phone: { x: "22%", y: "34%" },
    },
  },
  {
    id: "asset-37",
    image: asset37,
    aspectRatio: "42.06 / 42.06",
    artwork: reindeerArtwork,
    bodyType: "circle",
    desktop: { x: "88%", y: "9%", width: "4.5%", angle: 6 },
    phone: { x: "50%", y: "28%", width: "13%", angle: 6 },
    static: {
      desktop: { x: "90%", y: "12%" },
      phone: { x: "50%", y: "34%" },
    },
  },
  {
    id: "asset-38",
    image: asset38,
    aspectRatio: "51.61 / 42.06",
    artwork: reindeerArtwork,
    desktop: { x: "11%", y: "20%", width: "5.5%", angle: 8 },
    phone: { x: "78%", y: "29%", width: "15%", angle: 8 },
    static: {
      desktop: { x: "9%", y: "34%" },
      phone: { x: "78%", y: "34%" },
    },
  },
  {
    id: "asset-39",
    image: asset39,
    aspectRatio: "42.75 / 42.75",
    artwork: reindeerArtwork,
    desktop: { x: "23%", y: "21%", width: "4.5%", angle: -6 },
    static: { desktop: { x: "25%", y: "34%" } },
  },
  {
    id: "asset-40",
    image: asset40,
    aspectRatio: "394.77 / 62.57",
    artwork: reindeerArtwork,
    desktop: { x: "42%", y: "19%", width: "18%", angle: -3 },
    phone: { x: "50%", y: "40%", width: "58%", angle: -3 },
    static: {
      desktop: { x: "42%", y: "34%" },
      phone: { x: "50%", y: "45%" },
    },
  },
  {
    id: "asset-41",
    image: asset41,
    aspectRatio: "136.32 / 136.32",
    artwork: reindeerArtwork,
    desktop: { x: "63%", y: "22%", width: "7%", angle: 5 },
    phone: { x: "21%", y: "51%", width: "22%", angle: 5 },
    static: {
      desktop: { x: "59%", y: "34%" },
      phone: { x: "21%", y: "57%" },
    },
  },
  {
    id: "asset-42",
    image: asset42,
    aspectRatio: "134.78 / 134.77",
    artwork: reindeerArtwork,
    desktop: { x: "78%", y: "22%", width: "6.5%", angle: -5 },
    static: { desktop: { x: "76%", y: "34%" } },
  },
  {
    id: "asset-43",
    image: asset43,
    aspectRatio: "147.37 / 100.52",
    artwork: reindeerArtwork,
    desktop: { x: "91%", y: "22%", width: "8%", angle: 7 },
    phone: { x: "79%", y: "52%", width: "24%", angle: 7 },
    static: {
      desktop: { x: "91%", y: "34%" },
      phone: { x: "79%", y: "57%" },
    },
  },
  {
    id: "asset-44",
    image: asset44,
    aspectRatio: "527.1 / 179.59",
    artwork: reindeerArtwork,
    desktop: { x: "18%", y: "34%", width: "17%", angle: 4 },
    phone: { x: "50%", y: "61%", width: "56%", angle: 4 },
    static: {
      desktop: { x: "12%", y: "57%" },
      phone: { x: "50%", y: "67%" },
    },
  },
  {
    id: "asset-45",
    image: asset45,
    aspectRatio: "534.47 / 183.76",
    artwork: reindeerArtwork,
    desktop: { x: "39%", y: "35%", width: "17%", angle: -4 },
    phone: { x: "48%", y: "71%", width: "56%", angle: -4 },
    static: {
      desktop: { x: "30%", y: "57%" },
      phone: { x: "50%", y: "76%" },
    },
  },
  {
    id: "asset-46",
    image: asset46,
    aspectRatio: "441.91 / 150.92",
    artwork: reindeerArtwork,
    desktop: { x: "60%", y: "35%", width: "16%", angle: 5 },
    static: { desktop: { x: "48%", y: "57%" } },
  },
  {
    id: "asset-47",
    image: asset47,
    aspectRatio: "209.16 / 170.72",
    artwork: reindeerArtwork,
    desktop: { x: "79%", y: "35%", width: "8%", angle: -6 },
    static: { desktop: { x: "65%", y: "57%" } },
  },
  {
    id: "asset-48",
    image: asset48,
    aspectRatio: "332.78 / 332.78",
    artwork: reindeerArtwork,
    bodyType: "circle",
    desktop: { x: "91%", y: "37%", width: "10%", angle: 3 },
    phone: { x: "25%", y: "82%", width: "28%", angle: 3 },
    static: {
      desktop: { x: "83%", y: "57%" },
      phone: { x: "25%", y: "88%" },
    },
  },
  {
    id: "asset-49",
    image: asset49,
    aspectRatio: "168.86 / 152.84",
    artwork: reindeerArtwork,
    desktop: { x: "11%", y: "48%", width: "7%", angle: -5 },
    static: { desktop: { x: "9%", y: "80%" } },
  },
  {
    id: "asset-50",
    image: asset50,
    aspectRatio: "168.88 / 152.84",
    artwork: reindeerArtwork,
    desktop: { x: "25%", y: "48%", width: "7%", angle: 6 },
    static: { desktop: { x: "23%", y: "80%" } },
  },
  {
    id: "asset-51",
    image: asset51,
    aspectRatio: "586.27 / 201.37",
    artwork: reindeerArtwork,
    desktop: { x: "45%", y: "48%", width: "18%", angle: -3 },
    static: { desktop: { x: "40%", y: "80%" } },
  },
  {
    id: "asset-52",
    image: asset52,
    aspectRatio: "239.4 / 81.39",
    artwork: reindeerArtwork,
    desktop: { x: "65%", y: "49%", width: "11%", angle: 5 },
    static: { desktop: { x: "59%", y: "80%" } },
  },
  {
    id: "asset-53",
    image: asset53,
    aspectRatio: "239.4 / 216.71",
    artwork: reindeerArtwork,
    desktop: { x: "79%", y: "50%", width: "8%", angle: -6 },
    static: { desktop: { x: "75%", y: "80%" } },
  },
  {
    id: "asset-54",
    image: asset54,
    aspectRatio: "584.64 / 198.42",
    artwork: reindeerArtwork,
    desktop: { x: "48%", y: "61%", width: "20%", angle: 4 },
    phone: { x: "68%", y: "84%", width: "58%", angle: 4 },
    static: {
      desktop: { x: "91%", y: "80%" },
      phone: { x: "68%", y: "88%" },
    },
  },
  {
    id: "asset-55",
    image: asset55,
    aspectRatio: "246.2 / 216.71",
    artwork: reindeerArtwork,
    desktop: { x: "89%", y: "52%", width: "8%", angle: -4 },
    static: { desktop: { x: "92%", y: "57%" } },
  },
];

export function ReindeerGravityScene() {
  return (
    <PhysicsArtworkScene
      gravity={reindeerGravity}
      items={reindeerItems}
      palette={reindeerPalette}
      sceneId="reindeer"
    />
  );
}
