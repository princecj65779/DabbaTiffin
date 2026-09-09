/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bottle: {
          DEFAULT: "#2874F0",
          dark: "#1F5DBF",
        },
        saffron: {
          DEFAULT: "#F7D417",
        },
        cream: "#FFF7D6",
        surface: "#F1F3F6",
        canvas: "#E5E7EB",
        ink: "#172337",
        muted: "#878787",
        mutedwarm: "#565E6C",
        line: "#DADDE4",
        good: "#26A541",
        warn: "#D2322D",
        warnbg: "#FFF4E5",
        warnborder: "#F0A020",
        warntext: "#6F4B13",
        flipkart: {
          blue: "#2874F0",
          blueDark: "#1F5DBF",
          yellow: "#F7D417",
          orange: "#FB641B",
          link: "#0A58CA",
        },
      },
      fontFamily: {
        sans: ["Inter", "Arial", "Helvetica", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(23,35,55,.08)",
        phone: "0 18px 44px rgba(40,116,240,.18)",
      },
      borderRadius: {
        xl2: "8px",
      },
    },
  },
  plugins: [],
};
