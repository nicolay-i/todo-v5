/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 10px 40px -15px rgba(15, 23, 42, 0.45)",
      },
      colors: {
        primary: {
          50: "#f2f7ff",
          100: "#d9e7ff",
          200: "#b3ceff",
          300: "#8bb4ff",
          400: "#5a96ff",
          500: "#3578ff",
          600: "#245fe6",
          700: "#1b4ab4",
          800: "#163d91",
          900: "#132f6f",
        },
      },
    },
  },
  plugins: [],
}
