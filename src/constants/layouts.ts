// ===== Spread Layout Definitions =====
// Positions are center-points as % of container.
// Container aspect ratio is tuned per spread so cards never clip.

export interface LayoutPosition {
  x: string;
  y: string;
  rotate?: number;
}

export interface SpreadLayout {
  /** height / width ratio of the positioning container */
  aspectRatio: number;
  /** card pixel width */
  cardW: number;
  /** card pixel height */
  cardH: number;
  /** center-point positions for each card */
  positions: LayoutPosition[];
}

export function getSpreadLayout(spreadId: string, cardCount: number): SpreadLayout {
  switch (spreadId) {
    // ── 1 Card ──
    case "daily":
    case "yesno":
      return {
        aspectRatio: 0.6,
        cardW: 100,
        cardH: 160,
        positions: [
          { x: "50%", y: "46%" },
        ],
      };

    // ── 3 Cards ──
    case "three":
      return {
        aspectRatio: 0.58,
        cardW: 72,
        cardH: 115,
        positions: [
          { x: "20%", y: "46%" },
          { x: "50%", y: "46%" },
          { x: "80%", y: "46%" },
        ],
      };

    // ── 5 Card Cross ──
    case "five":
      return {
        aspectRatio: 1.0,
        cardW: 60,
        cardH: 96,
        positions: [
          { x: "18%", y: "48%" },   // 1: Left — Past
          { x: "50%", y: "48%" },   // 2: Center — Present
          { x: "82%", y: "48%" },   // 3: Right — Future
          { x: "50%", y: "82%" },   // 4: Bottom — Root
          { x: "50%", y: "15%" },   // 5: Top — Potential
        ],
      };

    // ── 7 Card Horseshoe ──
    case "horseshoe":
      return {
        aspectRatio: 0.85,
        cardW: 48,
        cardH: 77,
        positions: [
          { x: "13%", y: "82%" },   // 1: Bottom-left — Past
          { x: "13%", y: "50%" },   // 2: Mid-left — Present
          { x: "28%", y: "20%" },   // 3: Top-left — Hidden
          { x: "50%", y: "12%" },   // 4: Top-center — Advice
          { x: "72%", y: "20%" },   // 5: Top-right — People
          { x: "87%", y: "50%" },   // 6: Mid-right — Obstacle
          { x: "87%", y: "82%" },   // 7: Bottom-right — Outcome
        ],
      };

    // ── 10 Card Celtic Cross ──
    case "celtic":
      return {
        aspectRatio: 1.05,
        cardW: 46,
        cardH: 74,
        positions: [
          { x: "30%", y: "48%" },                // 1: Center — Present
          { x: "30%", y: "48%", rotate: 90 },    // 2: Cross — Challenge
          { x: "30%", y: "14%" },                 // 3: Above — Goal
          { x: "30%", y: "82%" },                 // 4: Below — Foundation
          { x: "12%", y: "48%" },                 // 5: Left — Past
          { x: "48%", y: "48%" },                 // 6: Right — Future
          { x: "78%", y: "84%" },                 // 7: Column bottom — Self
          { x: "78%", y: "62%" },                 // 8: Column — Environment
          { x: "78%", y: "38%" },                 // 9: Column — Hopes/Fears
          { x: "78%", y: "14%" },                 // 10: Column top — Outcome
        ],
      };

    // ── Fallback: even horizontal spread ──
    default:
      return {
        aspectRatio: 0.55,
        cardW: 70,
        cardH: 112,
        positions: Array.from({ length: cardCount }, (_, i) => ({
          x: `${18 + (i * 64) / Math.max(cardCount - 1, 1)}%`,
          y: "46%",
        })),
      };
  }
}
