"use client";

import asset3 from "../../assets/fcms/Asset 3.svg";
import asset4 from "../../assets/fcms/Asset 4.svg";
import asset5 from "../../assets/fcms/Asset 5.svg";
import asset6 from "../../assets/fcms/Asset 6.svg";
import asset7 from "../../assets/fcms/Asset 7.svg";
import asset8 from "../../assets/fcms/Asset 8.svg";
import asset9 from "../../assets/fcms/Asset 9.svg";
import asset10 from "../../assets/fcms/Asset 10.svg";
import asset11 from "../../assets/fcms/Asset 11.svg";
import asset12 from "../../assets/fcms/Asset 12.svg";
import asset13 from "../../assets/fcms/Asset 13.svg";
import asset14 from "../../assets/fcms/Asset 14.svg";
import asset15 from "../../assets/fcms/Asset 15.svg";
import asset16 from "../../assets/fcms/Asset 16.svg";
import asset17 from "../../assets/fcms/Asset 17.svg";
import asset18 from "../../assets/fcms/Asset 18.svg";
import asset19 from "../../assets/fcms/Asset 19.svg";
import asset20 from "../../assets/fcms/Asset 20.svg";
import asset21 from "../../assets/fcms/Asset 21.svg";
import asset22 from "../../assets/fcms/Asset 22.svg";
import {
  PhysicsArtworkScene,
  type PhysicsArtworkItem,
} from "@/components/physics-artwork-scene";

const fcmsGravity = { x: 0, y: 2 };

const fcmsItems: readonly PhysicsArtworkItem[] = [
  {
    id: "asset-3",
    image: asset3,
    aspectRatio: "767.55 / 462.66",
    desktop: { x: "10%", y: "8%", width: "14%", angle: -7 },
    phone: { x: "18%", y: "8%", width: "32%", angle: -5 },
    static: {
      desktop: { x: "10%", y: "12%" },
      phone: { x: "24%", y: "12%" },
    },
  },
  {
    id: "asset-4",
    image: asset4,
    aspectRatio: "767.55 / 462.66",
    desktop: { x: "28%", y: "12%", width: "14%", angle: 5 },
    static: { desktop: { x: "28%", y: "12%" } },
  },
  {
    id: "asset-5",
    image: asset5,
    aspectRatio: "767.55 / 462.66",
    desktop: { x: "47%", y: "7%", width: "13%", angle: -4 },
    phone: { x: "52%", y: "5%", width: "31%", angle: 4 },
    static: {
      desktop: { x: "47%", y: "12%" },
      phone: { x: "73%", y: "11%" },
    },
  },
  {
    id: "asset-6",
    image: asset6,
    aspectRatio: "767.55 / 462.66",
    desktop: { x: "67%", y: "14%", width: "13%", angle: 7 },
    phone: { x: "82%", y: "10%", width: "30%", angle: -4 },
    static: {
      desktop: { x: "66%", y: "12%" },
      phone: { x: "23%", y: "30%" },
    },
  },
  {
    id: "asset-7",
    image: asset7,
    aspectRatio: "571.69 / 444.8",
    desktop: { x: "87%", y: "9%", width: "11%", angle: -8 },
    phone: { x: "25%", y: "24%", width: "28%", angle: 7 },
    static: {
      desktop: { x: "86%", y: "12%" },
      phone: { x: "72%", y: "30%" },
    },
  },
  {
    id: "asset-8",
    image: asset8,
    aspectRatio: "571.69 / 444.8",
    desktop: { x: "18%", y: "24%", width: "11%", angle: 9 },
    static: { desktop: { x: "12%", y: "35%" } },
  },
  {
    id: "asset-9",
    image: asset9,
    aspectRatio: "657.08 / 622.93",
    desktop: { x: "38%", y: "21%", width: "9%", angle: -5 },
    phone: { x: "57%", y: "21%", width: "22%", angle: -6 },
    static: {
      desktop: { x: "31%", y: "35%" },
      phone: { x: "20%", y: "49%" },
    },
  },
  {
    id: "asset-10",
    image: asset10,
    aspectRatio: "767.55 / 598",
    desktop: { x: "58%", y: "28%", width: "12%", angle: 6 },
    static: { desktop: { x: "50%", y: "35%" } },
  },
  {
    id: "asset-11",
    image: asset11,
    aspectRatio: "729.66 / 393.64",
    desktop: { x: "78%", y: "23%", width: "13%", angle: -7 },
    static: { desktop: { x: "69%", y: "35%" } },
  },
  {
    id: "asset-12",
    image: asset12,
    aspectRatio: "517.77 / 546.15",
    desktop: { x: "92%", y: "27%", width: "8.5%", angle: 4 },
    static: { desktop: { x: "87%", y: "35%" } },
  },
  {
    id: "asset-13",
    image: asset13,
    aspectRatio: "517.77 / 546.15",
    desktop: { x: "8%", y: "37%", width: "8.5%", angle: 8 },
    static: { desktop: { x: "10%", y: "59%" } },
  },
  {
    id: "asset-14",
    image: asset14,
    aspectRatio: "657.08 / 622.93",
    desktop: { x: "26%", y: "34%", width: "9%", angle: -6 },
    static: { desktop: { x: "29%", y: "59%" } },
  },
  {
    id: "asset-15",
    image: asset15,
    aspectRatio: "767.55 / 598",
    desktop: { x: "44%", y: "40%", width: "12%", angle: 5 },
    phone: { x: "82%", y: "29%", width: "30%", angle: 5 },
    static: {
      desktop: { x: "48%", y: "59%" },
      phone: { x: "70%", y: "48%" },
    },
  },
  {
    id: "asset-16",
    image: asset16,
    aspectRatio: "767.55 / 598",
    desktop: { x: "64%", y: "36%", width: "12%", angle: -4 },
    static: { desktop: { x: "67%", y: "59%" } },
  },
  {
    id: "asset-17",
    image: asset17,
    aspectRatio: "729.66 / 393.64",
    desktop: { x: "82%", y: "42%", width: "13%", angle: 7 },
    static: { desktop: { x: "86%", y: "59%" } },
  },
  {
    id: "asset-18",
    image: asset18,
    aspectRatio: "1011.84 / 32.46",
    desktop: { x: "50%", y: "3%", width: "24%", angle: 0 },
    phone: { x: "48%", y: "37%", width: "58%", angle: 0 },
    static: {
      desktop: { x: "16%", y: "82%" },
      phone: { x: "50%", y: "64%" },
    },
  },
  {
    id: "asset-19",
    image: asset19,
    aspectRatio: "517.77 / 546.15",
    desktop: { x: "13%", y: "50%", width: "8.5%", angle: -5 },
    phone: { x: "18%", y: "40%", width: "21%", angle: -5 },
    static: {
      desktop: { x: "34%", y: "82%" },
      phone: { x: "18%", y: "84%" },
    },
  },
  {
    id: "asset-20",
    image: asset20,
    aspectRatio: "517.77 / 546.15",
    desktop: { x: "34%", y: "48%", width: "8.5%", angle: 6 },
    static: { desktop: { x: "51%", y: "82%" } },
  },
  {
    id: "asset-21",
    image: asset21,
    aspectRatio: "852.92 / 499.77",
    desktop: { x: "70%", y: "51%", width: "12%", angle: -7 },
    phone: { x: "50%", y: "50%", width: "31%", angle: 6 },
    static: {
      desktop: { x: "70%", y: "82%" },
      phone: { x: "51%", y: "84%" },
    },
  },
  {
    id: "asset-22",
    image: asset22,
    aspectRatio: "765.24 / 800.29",
    desktop: { x: "92%", y: "48%", width: "8.5%", angle: 4 },
    phone: { x: "83%", y: "44%", width: "22%", angle: -4 },
    static: {
      desktop: { x: "89%", y: "82%" },
      phone: { x: "84%", y: "82%" },
    },
  },
];

export function FcmsGravityScene() {
  return (
    <PhysicsArtworkScene
      gravity={fcmsGravity}
      items={fcmsItems}
      sceneId="fcms"
    />
  );
}
