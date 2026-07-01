"use client";

import asset6 from "../../assets/d7/Asset 6.svg";
import asset7 from "../../assets/d7/Asset 7.svg";
import asset8 from "../../assets/d7/Asset 8.svg";
import asset9 from "../../assets/d7/Asset 9.svg";
import asset10 from "../../assets/d7/Asset 10.svg";
import asset11 from "../../assets/d7/Asset 11.svg";
import asset12 from "../../assets/d7/Asset 12.svg";
import asset13 from "../../assets/d7/Asset 13.svg";
import asset14 from "../../assets/d7/Asset 14.svg";
import asset15 from "../../assets/d7/Asset 15.svg";
import asset16 from "../../assets/d7/Asset 16.svg";
import asset17 from "../../assets/d7/Asset 17.svg";
import {
  PhysicsArtworkScene,
  type PhysicsArtworkItem,
} from "@/components/physics-artwork-scene";

const d7Gravity = { x: 0, y: 3 };

const d7Items: readonly PhysicsArtworkItem[] = [
  {
    id: "asset-6",
    image: asset6,
    aspectRatio: "1 / 1",
    bodyType: "circle",
    desktop: { x: "10%", y: "12%", width: "10%", angle: -6 },
    phone: { x: "17%", y: "8%", width: "25%", angle: -6 },
    static: {
      desktop: { x: "12%", y: "16%" },
      phone: { x: "18%", y: "12%" },
    },
  },
  {
    id: "asset-7",
    image: asset7,
    aspectRatio: "1623.19 / 567.98",
    desktop: { x: "29%", y: "8%", width: "18%", angle: 4 },
    phone: { x: "62%", y: "9%", width: "48%", angle: 4 },
    static: {
      desktop: { x: "37%", y: "16%" },
      phone: { x: "64%", y: "12%" },
    },
  },
  {
    id: "asset-8",
    image: asset8,
    aspectRatio: "1 / 1",
    bodyType: "circle",
    desktop: { x: "47%", y: "12%", width: "8%", angle: -5 },
    phone: { x: "15%", y: "25%", width: "22%", angle: -5 },
    static: {
      desktop: { x: "64%", y: "15%" },
      phone: { x: "12%", y: "31%" },
    },
  },
  {
    id: "asset-9",
    image: asset9,
    aspectRatio: "1 / 1",
    bodyType: "circle",
    desktop: { x: "62%", y: "8%", width: "8%", angle: 7 },
    phone: { x: "40%", y: "22%", width: "22%", angle: 7 },
    static: {
      desktop: { x: "88%", y: "16%" },
      phone: { x: "37%", y: "29%" },
    },
  },
  {
    id: "asset-10",
    image: asset10,
    aspectRatio: "1 / 1",
    bodyType: "circle",
    desktop: { x: "76%", y: "15%", width: "8%", angle: -4 },
    phone: { x: "66%", y: "25%", width: "22%", angle: -4 },
    static: {
      desktop: { x: "12%", y: "47%" },
      phone: { x: "63%", y: "31%" },
    },
  },
  {
    id: "asset-11",
    image: asset11,
    aspectRatio: "1 / 1",
    bodyType: "circle",
    desktop: { x: "91%", y: "10%", width: "8%", angle: 6 },
    phone: { x: "88%", y: "34%", width: "20%", angle: 6 },
    static: {
      desktop: { x: "34%", y: "45%" },
      phone: { x: "88%", y: "29%" },
    },
  },
  {
    id: "asset-12",
    image: asset12,
    aspectRatio: "345.83 / 39.62",
    desktop: { x: "17%", y: "29%", width: "21%", angle: -3 },
    phone: { x: "32%", y: "39%", width: "58%", angle: -3 },
    static: {
      desktop: { x: "62%", y: "45%" },
      phone: { x: "32%", y: "46%" },
    },
  },
  {
    id: "asset-13",
    image: asset13,
    aspectRatio: "1101.39 / 318.32",
    desktop: { x: "41%", y: "27%", width: "20%", angle: 5 },
    phone: { x: "71%", y: "48%", width: "50%", angle: 5 },
    static: {
      desktop: { x: "86%", y: "45%" },
      phone: { x: "70%", y: "50%" },
    },
  },
  {
    id: "asset-14",
    image: asset14,
    aspectRatio: "464.3 / 316.88",
    desktop: { x: "61%", y: "34%", width: "12%", angle: -6 },
    phone: { x: "18%", y: "58%", width: "31%", angle: -6 },
    static: {
      desktop: { x: "14%", y: "78%" },
      phone: { x: "18%", y: "67%" },
    },
  },
  {
    id: "asset-15",
    image: asset15,
    aspectRatio: "648.82 / 316.88",
    desktop: { x: "77%", y: "29%", width: "16%", angle: 4 },
    phone: { x: "60%", y: "62%", width: "46%", angle: 4 },
    static: {
      desktop: { x: "38%", y: "78%" },
      phone: { x: "65%", y: "67%" },
    },
  },
  {
    id: "asset-16",
    image: asset16,
    aspectRatio: "2203.91 / 318.08",
    desktop: { x: "43%", y: "45%", width: "25%", angle: -2 },
    phone: { x: "42%", y: "74%", width: "68%", angle: -2 },
    static: {
      desktop: { x: "65%", y: "78%" },
      phone: { x: "38%", y: "83%" },
    },
  },
  {
    id: "asset-17",
    image: asset17,
    aspectRatio: "463.98 / 430.73",
    desktop: { x: "90%", y: "42%", width: "11%", angle: 5 },
    phone: { x: "83%", y: "72%", width: "29%", angle: 5 },
    static: {
      desktop: { x: "89%", y: "78%" },
      phone: { x: "83%", y: "84%" },
    },
  },
];

type D7GravitySceneProps = {
  onSettled?: () => void;
};

export function D7GravityScene({ onSettled }: D7GravitySceneProps) {
  return (
    <PhysicsArtworkScene
      gravity={d7Gravity}
      items={d7Items}
      onSettled={onSettled}
      sceneId="d7"
    />
  );
}
