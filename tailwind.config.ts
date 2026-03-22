import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: "var(--gold)",
        "gold-light": "var(--gold-light)",
        "gold-dim": "var(--gold-dim)",
        crimson: "var(--crimson)",
        "crimson-light": "var(--crimson-light)",
        bg: "var(--bg)",
        surface: "var(--surface)",
        "card-bg": "var(--card-bg)",
      },
      fontFamily: {
        noto: ["var(--font-noto)", "Noto Sans Thai", "sans-serif"],
        serif: ["var(--font-serif)", "Noto Serif Thai", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
