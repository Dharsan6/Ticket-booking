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
          bg: '#07080f',
          surface: '#0f1123',
          card: '#13162b',
          border: '#1f2442',
          muted: '#8b92b2',
          primary: '#7c3aed',
          primaryHover: '#6d28d9',
          accent: '#a855f7',
        },
        seat: {
          available: '#10b981',
          selected: '#8b5cf6',
          booked: '#ef4444',
          held: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
