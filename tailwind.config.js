/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        graphite: {
          950: "#181A20",
          900: "#20232B",
          800: "#2A2E38",
          700: "#3A3F4C",
        },
        bone: {
          100: "#F0EDE6",
          200: "#E4E0D6",
          400: "#B9B4A8",
        },
        redline: {
          DEFAULT: "#FF5A36",
          dim: "#C7461F",
          soft: "#3A2620",
        },
        signal: {
          DEFAULT: "#5B8BFF",
        },
      },
      fontFamily: {
        mono: ["'JetBrains Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
        sans: ["'Inter'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "ledger-lines":
          "repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(240,237,230,0.05) 28px)",
      },
    },
  },
  plugins: [],
};
