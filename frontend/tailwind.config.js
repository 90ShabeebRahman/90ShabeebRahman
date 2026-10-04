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
        brand: {
          50: '#f0f4ff',
          100: '#e0e8ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          accent: '#818cf8',
        },
        surface: {
          base: '#09090b',
          card: '#121215',
          hover: '#1a1a22',
          border: '#27272a',
          muted: '#71717a',
        }
      },
    },
  },
  plugins: [],
}
