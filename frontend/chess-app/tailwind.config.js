export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        board: {
          dark: "#1a1a2e",
          card: "#16213e",
          accent: "#e2b96f",
          muted: "#8892a4",
        },
      },
    },
  },
  plugins: [],
};