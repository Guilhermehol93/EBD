import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        church: {
          50: "#f0f6fe",
          100: "#e0edfd",
          200: "#b9dbfb",
          300: "#7cbef7",
          400: "#379df1",
          500: "#0d81e2",
          600: "#0265c1",
          700: "#03519d",
          800: "#074581",
          900: "#0c3b6c",
          950: "#082548",
        },
        navy: {
          800: "#132338",
          900: "#0b1523",
          950: "#060b13",
        },
        gold: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
