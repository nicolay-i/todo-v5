/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        outline: '0 0 0 2px rgba(79, 70, 229, 0.35)',
      },
    },
  },
  plugins: [],
}
