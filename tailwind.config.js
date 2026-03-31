/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4c1d95",
        "primary-light": "#8b5cf6",
        lavender: "#e0d7f7",
        "lavender-dark": "#c4b5fd",
      },
      fontFamily: {
        headline: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
    },
  },
  plugins: [],
};