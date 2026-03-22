// ===== THEME CONFIG =====
// Change card back image and background here.
// Set cardBackImage to a URL/path to use an image instead of SVG.
// Set backgroundImage to a URL/path for a custom background.

export const THEME = {
  // ── Card Back ──
  // Set to image URL to replace SVG card back (e.g., "/card-back.png")
  // Set to null to use default SVG design
  cardBackImage: null as string | null,

  // ── Background ──
  // Set to image URL for background (e.g., "/bg.jpg")
  // Set to null to use default CSS gradient
  backgroundImage: null as string | null,
  backgroundColor: "#08090e",

  // ── Colors ──
  gold: "#e8d48b",
  goldLight: "#f5e8b0",
  goldDim: "rgba(232, 212, 139, 0.2)",
  surface: "#10111a",
  cardBg: "#0c0d14",
} as const;
