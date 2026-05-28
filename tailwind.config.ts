import type { Config } from "tailwindcss";

// Brand tokens — see verify/brand.jsx and CLAUDE.md §6.
// Cool, restrained, LinkedIn-adjacent. Sienna keys preserved for compat;
// they hold blues now.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#f3f2ef",
        paper: "#ffffff",
        ink: "#1c1c1c",
        "ink-soft": "#3a3a3d",
        muted: "#5e6166",
        "muted-soft": "#8d9197",
        border: "#e0e0e0",
        "border-soft": "#f0f0f0",
        sienna: "#0a5cad",
        "sienna-soft": "#d6e4f2",
        verified: "#067a5e",
        "verified-soft": "#d8eee5",
        ochre: "#073563",
      },
      fontFamily: {
        sans: ['var(--font-sans)', '"Source Sans 3"', "system-ui", "sans-serif"],
        serif: ['var(--font-serif)', '"Source Serif 4"', "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(0,0,0,0.04), 0 8px 24px -12px rgba(0,0,0,0.12)",
      },
      letterSpacing: {
        tightish: "-0.015em",
      },
    },
  },
  plugins: [],
};

export default config;
