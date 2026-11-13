import type { Config } from "tailwindcss";
const config: Config = { content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"], theme: { extend: { colors: { ink: "#102a2a", forest: "#087f5b", mint: "#dff4e9", cream: "#f8f8f3", gold: "#d4aa58" }, boxShadow: { soft: "0 14px 42px rgba(16,42,42,.08)" } } }, plugins: [] };
export default config;
