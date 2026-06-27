import type { Metadata } from "next";
import { designTokens } from "@/config/design-tokens";
import { siteCopy } from "@/config/copy";
import { siteFonts } from "@/config/fonts";
import { defineCssVars } from "@/lib/css-vars";
import "./globals.css";

export const metadata: Metadata = {
  title: siteCopy.metadata.title,
  description: siteCopy.metadata.description,
};

const rootStyle = defineCssVars({
  "--site-background": designTokens.colors.brandRed,
  "--site-foreground": designTokens.colors.brandWhite,
  "--site-font-mono": designTokens.fonts.mono,
  "--site-font-sans": designTokens.fonts.sans,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${siteFonts.sans.variable} ${siteFonts.mono.variable} ${siteFonts.title.variable} h-full antialiased`}
      style={rootStyle}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
