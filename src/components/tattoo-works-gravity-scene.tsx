"use client";

import tattoo013 from "../../assets/tattoos/013.png";
import tattoo018 from "../../assets/tattoos/018.png";
import tattoo020 from "../../assets/tattoos/020.png";
import tattoo022 from "../../assets/tattoos/022.png";
import tattoo035 from "../../assets/tattoos/035.png";
import tattoo040 from "../../assets/tattoos/040.png";
import tattoo049 from "../../assets/tattoos/049.png";
import tattoo062 from "../../assets/tattoos/062.png";
import tattoo069 from "../../assets/tattoos/069.png";
import {
  PhysicsArtworkScene,
  type PhysicsArtworkItem,
} from "@/components/physics-artwork-scene";

const tattooWorksGravity = { x: 0, y: 3 };

const tattooWorksItems: readonly PhysicsArtworkItem[] = [
  {
    id: "013",
    image: tattoo013,
    aspectRatio: "5920 / 3879",
    artwork: {
      alphaCrop: {
        canvas: { width: 8121, height: 6345 },
        crop: { x: 1530, y: 1088, width: 5920, height: 3879 },
      },
    },
    desktop: { x: "14%", y: "8%", width: "16%", angle: -5 },
    phone: { x: "32%", y: "8%", width: "52%", angle: -5 },
    static: {
      desktop: { x: "16%", y: "16%" },
      phone: { x: "31%", y: "11%" },
    },
  },
  {
    id: "018",
    image: tattoo018,
    aspectRatio: "5145 / 5489",
    artwork: {
      alphaCrop: {
        canvas: { width: 8119, height: 6335 },
        crop: { x: 1316, y: 366, width: 5145, height: 5489 },
      },
    },
    desktop: { x: "34%", y: "8%", width: "12%", angle: 4 },
    phone: { x: "72%", y: "10%", width: "36%", angle: 4 },
    static: {
      desktop: { x: "50%", y: "16%" },
      phone: { x: "72%", y: "13%" },
    },
  },
  {
    id: "020",
    image: tattoo020,
    aspectRatio: "4096 / 4686",
    artwork: {
      alphaCrop: {
        canvas: { width: 7421, height: 6392 },
        crop: { x: 1096, y: 502, width: 4096, height: 4686 },
      },
    },
    desktop: { x: "51%", y: "8%", width: "12%", angle: -4 },
    phone: { x: "28%", y: "28%", width: "34%", angle: -4 },
    static: {
      desktop: { x: "83%", y: "16%" },
      phone: { x: "29%", y: "33%" },
    },
  },
  {
    id: "022",
    image: tattoo022,
    aspectRatio: "4406 / 3301",
    artwork: {
      alphaCrop: {
        canvas: { width: 8804, height: 6787 },
        crop: { x: 2719, y: 2163, width: 4406, height: 3301 },
      },
    },
    desktop: { x: "70%", y: "10%", width: "15%", angle: 5 },
    phone: { x: "70%", y: "30%", width: "46%", angle: 5 },
    static: {
      desktop: { x: "16%", y: "47%" },
      phone: { x: "70%", y: "34%" },
    },
  },
  {
    id: "035",
    image: tattoo035,
    aspectRatio: "3522 / 4114",
    artwork: {
      alphaCrop: {
        canvas: { width: 3522, height: 5092 },
        crop: { x: 0, y: 978, width: 3522, height: 4114 },
      },
    },
    desktop: { x: "88%", y: "13%", width: "11%", angle: -3 },
    phone: { x: "26%", y: "49%", width: "34%", angle: -3 },
    static: {
      desktop: { x: "50%", y: "47%" },
      phone: { x: "28%", y: "55%" },
    },
  },
  {
    id: "040",
    image: tattoo040,
    aspectRatio: "1824 / 886",
    artwork: {
      alphaCrop: {
        canvas: { width: 2552, height: 1787 },
        crop: { x: 379, y: 257, width: 1824, height: 886 },
      },
    },
    desktop: { x: "21%", y: "31%", width: "17%", angle: 4 },
    phone: { x: "70%", y: "50%", width: "50%", angle: 4 },
    static: {
      desktop: { x: "83%", y: "47%" },
      phone: { x: "70%", y: "55%" },
    },
  },
  {
    id: "049",
    image: tattoo049,
    aspectRatio: "1415 / 851",
    artwork: {
      alphaCrop: {
        canvas: { width: 1600, height: 1123 },
        crop: { x: 70, y: 97, width: 1415, height: 851 },
      },
    },
    desktop: { x: "43%", y: "31%", width: "14%", angle: -5 },
    phone: { x: "30%", y: "66%", width: "44%", angle: -5 },
    static: {
      desktop: { x: "16%", y: "78%" },
      phone: { x: "30%", y: "72%" },
    },
  },
  {
    id: "062",
    image: tattoo062,
    aspectRatio: "792 / 1477",
    artwork: {
      alphaCrop: {
        canvas: { width: 1133, height: 1538 },
        crop: { x: 242, y: 7, width: 792, height: 1477 },
      },
    },
    desktop: { x: "62%", y: "33%", width: "8%", angle: 5 },
    phone: { x: "72%", y: "68%", width: "26%", angle: 5 },
    static: {
      desktop: { x: "50%", y: "78%" },
      phone: { x: "72%", y: "72%" },
    },
  },
  {
    id: "069",
    image: tattoo069,
    aspectRatio: "1075 / 822",
    artwork: {
      alphaCrop: {
        canvas: { width: 1280, height: 1693 },
        crop: { x: 155, y: 421, width: 1075, height: 822 },
      },
    },
    desktop: { x: "83%", y: "36%", width: "14%", angle: -4 },
    phone: { x: "50%", y: "84%", width: "44%", angle: -4 },
    static: {
      desktop: { x: "83%", y: "78%" },
      phone: { x: "50%", y: "89%" },
    },
  },
];

type TattooWorksGravitySceneProps = {
  onSettled?: () => void;
};

export function TattooWorksGravityScene({
  onSettled,
}: TattooWorksGravitySceneProps) {
  return (
    <PhysicsArtworkScene
      gravity={tattooWorksGravity}
      items={tattooWorksItems}
      onSettled={onSettled}
      sceneId="tattoo-works"
    />
  );
}
