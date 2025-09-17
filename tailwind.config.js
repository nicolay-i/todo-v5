/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0f172a',
          foreground: '#f8fafc',
          muted: '#1e293b',
        },
      },
    },
  },
  plugins: [],
}
