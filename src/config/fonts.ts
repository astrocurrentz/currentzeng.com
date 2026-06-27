import localFont from "next/font/local";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dtGetaiGroteskDisplay = localFont({
  src: "../assets/fonts/DTGetaiGroteskDisplay-Black.ttf",
  display: "swap",
  fallback: ["Arial Black", "Impact", "system-ui", "sans-serif"],
  variable: "--font-brand",
  weight: "900",
});

export const siteFonts = {
  sans: geistSans,
  mono: geistMono,
  title: dtGetaiGroteskDisplay,
} as const;
