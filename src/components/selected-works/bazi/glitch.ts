import { createGlitchFrames } from "@/lib/glitch-text";
import { clamp } from "../shared";
import { BAZI_SECTION_GLITCH_CHARS } from "./constants";

export type SectionTextTarget = {
  node: Text;
  originalText: string;
};

export type ButtonIconTarget = {
  node: HTMLElement;
  originalClipPath: string;
  originalFilter: string;
  originalOpacity: string;
  originalTransform: string;
};

export const collectSectionTextTargets = (
  sectionElement: HTMLElement,
): SectionTextTarget[] => {
  const walker = document.createTreeWalker(sectionElement, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      if (!(node instanceof Text) || !node.data.trim()) {
        return NodeFilter.FILTER_REJECT;
      }

      const parentElement = node.parentElement;
      if (!parentElement) {
        return NodeFilter.FILTER_REJECT;
      }

      if (
        parentElement.closest(
          'script, style, svg, input, textarea, select, option, [contenteditable="true"], [aria-hidden="true"]',
        )
      ) {
        return NodeFilter.FILTER_REJECT;
      }

      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const targets: SectionTextTarget[] = [];
  let currentNode = walker.nextNode();

  while (currentNode) {
    const textNode = currentNode as Text;
    targets.push({
      node: textNode,
      originalText: textNode.data,
    });
    currentNode = walker.nextNode();
  }

  return targets;
};

export const scrambleSectionText = (sourceText: string, revealIndex: number) => {
  const frameCount = Math.max(2, sourceText.length + 1);
  const frameIndex = clamp(Math.floor(revealIndex), 0, frameCount - 1);

  return (
    createGlitchFrames({
      frameCount,
      glyphs: BAZI_SECTION_GLITCH_CHARS,
      lines: [sourceText],
    })[frameIndex]?.[0] ?? sourceText
  );
};

export const collectButtonIconTargets = (
  buttonElement: HTMLElement,
): ButtonIconTarget[] =>
  Array.from(
    buttonElement.querySelectorAll<HTMLElement>(
      ".bazi-icon-glyph, svg",
    ),
  ).map((iconNode) => ({
    node: iconNode,
    originalClipPath: iconNode.style.clipPath,
    originalFilter: iconNode.style.filter,
    originalOpacity: iconNode.style.opacity,
    originalTransform: iconNode.style.transform,
  }));

export const applyButtonIconGlitchFrame = (
  targets: ButtonIconTarget[],
  intensity: number,
) => {
  targets.forEach((target, index) => {
    if (!target.node.isConnected) {
      return;
    }

    const direction = index % 2 === 0 ? 1 : -1;
    const shiftX = direction * 2.8 * intensity;
    const shiftY = (index % 3) * 0.8 * intensity;
    const topInset = 18 * intensity;
    const bottomInset = 12 * intensity;

    target.node.style.transform = `translate(${shiftX.toFixed(2)}px, ${shiftY.toFixed(2)}px)`;
    target.node.style.opacity = `${clamp(1 - 0.12 * intensity, 0.72, 1).toFixed(3)}`;
    target.node.style.filter = `brightness(${(1 + 0.22 * intensity).toFixed(3)}) contrast(${(1 + 0.38 * intensity).toFixed(3)})`;
    target.node.style.clipPath =
      intensity > 0.06
        ? `inset(${topInset.toFixed(2)}% 0 ${bottomInset.toFixed(2)}% 0)`
        : "";
  });
};
