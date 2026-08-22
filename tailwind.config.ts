import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#1b1e23",
        paper: "#f6f5f2",
        line: "#dcd9d2",
        accent: "#3b5bdb",
        warn: "#b5490f",
      },
    },
  },
  plugins: [],
};
export default config;
