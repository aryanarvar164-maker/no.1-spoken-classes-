import type { Config } from "tailwindcss";

/**
 * "Formal Signboard" palette — Indian signboard boldness, kept orderly.
 *   cream     #FFF8EA  page ground
 *   teal      #0E3B3D  text, borders, dark sections (the "ink")
 *   red       #C8371F  primary actions + key words (passes 4.5:1 with white)
 *   marigold  #F2A91B  highlights, badges, numbers on teal
 *   mint/blush         soft tints for batch-card headers only
 *   flag      #8B5CF6  placeholder marker only — deliberately NOT a brand colour
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./content/**/*.ts"],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: "#FFF8EA", 200: "#F3E9D2", 300: "#E3D7BE" },
        teal: { DEFAULT: "#0E3B3D", 700: "#134B4E", 900: "#0A2B2D", muted: "#3F6264" },
        red: { DEFAULT: "#C8371F", 600: "#A92D18" },
        marigold: "#F2A91B",
        mint: "#8FD3C1",
        blush: "#FFC2B4",
        flag: "#8B5CF6",
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(3.25rem, 8.4vw, 7rem)", { lineHeight: "0.94", letterSpacing: "0" }],
        "display-lg": ["clamp(2.4rem, 5vw, 4rem)", { lineHeight: "1", letterSpacing: "0" }],
        "display-md": ["clamp(1.6rem, 2.6vw, 2.1rem)", { lineHeight: "1.05" }],
      },
      boxShadow: {
        hard: "4px 4px 0 0 #0E3B3D",
        "hard-lg": "6px 6px 0 0 #0E3B3D",
        "hard-cream": "4px 4px 0 0 #FFF8EA",
      },
      maxWidth: { site: "75rem" },
    },
  },
  plugins: [],
};

export default config;
