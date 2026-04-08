import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        discovery: "#6475FA",
        sales: "#E8650A",
        support: "#22C55E",
        ink: "#121212",
        cream: "#F7F3EC"
      },
      fontFamily: {
        sans: ["Georgia", "ui-serif", "serif"]
      }
    }
  },
  plugins: []
};

export default config;

