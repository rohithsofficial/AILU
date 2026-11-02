import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { ailu: { yellow: "#F5C400", black: "#111111", cream: "#FFFDF7" } },
      fontFamily: { display: ["var(--font-poppins)", "system-ui", "sans-serif"], body: ["var(--font-inter)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
