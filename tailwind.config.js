/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/page-components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'canvas-light': '#f4f7fb',
        'canvas-dark': '#0f172a',
      },
    }
  },
  plugins: []
}
