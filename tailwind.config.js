/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        snap: {
          yellow: "#FFFC00",
          dark: "#0D0D1A",
          darkMid: "#1A1A2E",
          white50: "rgba(255,255,255,0.5)",
          white10: "rgba(255,255,255,0.1)",
        },
        call: {
          green: "#16A34A",
          red: "#DC2626",
        },
      },
    },
  },
  plugins: [],
}