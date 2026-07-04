/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#09090b",
        glassBg: "rgba(15, 15, 20, 0.6)",
        glassBorder: "rgba(255, 255, 255, 0.08)",
        goldAccent: "#d97706",
        yieldGreen: "#10b981",
        opsCyan: "#06b6d4",
        treasuryPurple: "#8b5cf6",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-slow": "glow 4s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(6, 182, 212, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(6, 182, 212, 0.6)" },
        },
      },
    },
  },
  plugins: [],
}
