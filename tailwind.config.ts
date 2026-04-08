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
        background: "var(--background)",
        foreground: "var(--foreground)",
        river: {
          50:  "#e8f4fd",
          100: "#c8e6fa",
          200: "#93cbf5",
          300: "#64b5f6",
          400: "#2196f3",
          500: "#1976d2",
          600: "#1565c0",
          700: "#0d47a1",
          800: "#0a3880",
          900: "#072860",
        },
        gold: {
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f9c72a",
          600: "#f5a623",
          700: "#d97706",
        },
        cream: "#fef3e2",
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", '"Times New Roman"', "serif"],
      },
      keyframes: {
        wave: {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(-15px)" },
        },
        "wave-slow": {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(10px)" },
        },
      },
      animation: {
        wave: "wave 6s ease-in-out infinite",
        "wave-slow": "wave-slow 9s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
