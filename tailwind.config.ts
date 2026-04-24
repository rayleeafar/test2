import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        snake: {
          head: "#22c55e",
          body: "#16a34a",
        },
        food: "#ef4444",
        obstacle: "#374151",
        board: "#1f2937",
      },
    },
  },
  plugins: [],
};

export default config;
