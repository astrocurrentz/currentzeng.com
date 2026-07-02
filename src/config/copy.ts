export const siteCopy = {
  metadata: {
    title: "Current Zeng",
    description: "Portfolio of Current Zeng.",
  },
  brand: {
    ariaLabel: "Current Zeng",
    lines: ["CURRENT", "ZENG"],
  },
  footer: {
    navigationAriaLabel: "Contact and social links",
    wordmark: "Current",
    links: {
      github: {
        ariaLabel: "GitHub (opens in a new tab)",
        href: "https://github.com/astrocurrentz",
        label: "GitHub",
      },
      instagram: {
        ariaLabel: "Instagram (opens in a new tab)",
        href: "https://www.instagram.com/current_astro_",
        label: "Instagram",
      },
      email: {
        ariaLabel: "Email Current Zeng",
        href: "mailto:me@currentzeng.com",
        label: "Email",
      },
      phone: {
        ariaLabel: "Copy phone number 6047226954",
        copiedLabel: "Copied",
        copiedMessage: "Phone number copied to clipboard.",
        failedLabel: "Copy failed",
        failedMessage: "Phone number could not be copied. Try again.",
        label: "Phone",
        value: "6047226954",
      },
    },
  },
  intro: {
    ariaLabel: "Creative engineer, designer, musician, and product builder",
    lines: [
      "creative",
      "engineer",
      "designer",
      "musician",
      "product builder",
    ],
  },
  glitch: {
    glyphs: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\|_+-=<>#%&$@",
  },
} as const;
