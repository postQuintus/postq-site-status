/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#04000f",
        bg2: "#08001a",
        bg3: "#1a1a24",
        accent: "#cf00a3",
        accent2: "#931b79",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        "eesti-display": [
          '"GT Eesti Pro Display"',
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        "eesti-text": [
          '"GT Eesti Pro Text"',
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
}
