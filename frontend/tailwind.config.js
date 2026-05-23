/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "#4CAF50",
        background: "#0f0f0f",
        surface: "#1a1a1a",
      },
    },
  },
  plugins: [],
}
