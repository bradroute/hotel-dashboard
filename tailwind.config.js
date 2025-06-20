/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        operon: {
          blue: "#38bdf8",        // updated from #47B2FF
          'blue-dark': "#199BEF",
          charcoal: "#2D2D2D",
          background: "#F8F9FB",
          gold: "#facc15",
          error: "#ef4444",
          warning: "#fbbf24",
          success: "#22c55e"
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [],
}
