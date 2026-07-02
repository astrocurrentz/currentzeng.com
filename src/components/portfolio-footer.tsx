"use client";

import { useEffect, useRef, useState } from "react";
import { CenterUnderline } from "@/components/fancy/text/underline-center";
import { designTokens } from "@/config/design-tokens";
import { siteCopy } from "@/config/copy";
import { defineCssVars } from "@/lib/css-vars";
import styles from "./portfolio-footer.module.css";

type CopyState = "copied" | "failed" | "idle";

const footerTokens = designTokens.components.portfolioFooter;

const footerStyle = defineCssVars({
  "--portfolio-footer-background": designTokens.colors.brandRed,
  "--portfolio-footer-block-size": footerTokens.blockSize,
  "--portfolio-footer-foreground": designTokens.colors.brandWhite,
  "--portfolio-footer-wordmark-size": footerTokens.wordmarkFontSize,
  "--portfolio-footer-wordmark-translate-y":
    footerTokens.wordmarkTranslateY,
});

function legacyCopyText(text: string) {
  const textArea = document.createElement("textarea");

  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.inset = "0 auto auto -9999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  const didCopy = document.execCommand("copy");

  textArea.remove();

  return didCopy;
}

async function copyText(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the legacy browser copy path.
    }
  }

  try {
    return legacyCopyText(text);
  } catch {
    return false;
  }
}

export function PortfolioFooter() {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const { email, github, instagram, phone } = siteCopy.footer.links;

  useEffect(
    () => () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    },
    [],
  );

  const handlePhoneClick = async () => {
    const didCopy = await copyText(phone.value);
    const nextState = didCopy ? "copied" : "failed";

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    setCopyState(nextState);
    resetTimerRef.current = setTimeout(() => {
      setCopyState("idle");
      resetTimerRef.current = null;
    }, 1500);
  };

  const phoneLabel =
    copyState === "copied"
      ? phone.copiedLabel
      : copyState === "failed"
        ? phone.failedLabel
        : phone.label;
  const statusMessage =
    copyState === "copied"
      ? phone.copiedMessage
      : copyState === "failed"
        ? phone.failedMessage
        : "";

  return (
    <footer className={styles.footer} style={footerStyle}>
      <p aria-hidden="true" className={styles.wordmark}>
        {siteCopy.footer.wordmark}
      </p>
      <nav
        aria-label={siteCopy.footer.navigationAriaLabel}
        className={styles.navigation}
      >
        <ul className={styles.linkList}>
          <li>
            <CenterUnderline
              aria-label={github.ariaLabel}
              as="a"
              className={styles.contactControl}
              href={github.href}
              rel="noopener noreferrer"
              target="_blank"
            >
              {github.label}
            </CenterUnderline>
          </li>
          <li>
            <CenterUnderline
              aria-label={instagram.ariaLabel}
              as="a"
              className={styles.contactControl}
              href={instagram.href}
              rel="noopener noreferrer"
              target="_blank"
            >
              {instagram.label}
            </CenterUnderline>
          </li>
          <li>
            <CenterUnderline
              aria-label={email.ariaLabel}
              as="a"
              className={styles.contactControl}
              href={email.href}
            >
              {email.label}
            </CenterUnderline>
          </li>
          <li>
            <CenterUnderline
              aria-label={
                copyState === "idle" ? phone.ariaLabel : statusMessage
              }
              as="button"
              className={`${styles.contactControl} ${styles.phoneControl}`}
              onClick={handlePhoneClick}
            >
              {phoneLabel}
            </CenterUnderline>
          </li>
        </ul>
        <p aria-atomic="true" aria-live="polite" className="sr-only">
          {statusMessage}
        </p>
      </nav>
    </footer>
  );
}
