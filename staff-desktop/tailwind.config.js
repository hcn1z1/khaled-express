/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Khaled Express Luxury Champagne Gold & Warm Amber (matches landing page)
        brand: {
          50: '#faf8f2',
          100: '#f4eedd',
          200: '#eadbba',
          300: '#dec693',
          400: '#d4b87c',
          500: '#c5a358',
          600: '#ab883f',
          700: '#8c6d2d',
          800: '#6b5220',
          900: '#4b3814',
          950: '#291e0a',
        },
        // Refined Obsidian & Charcoal dark surfaces
        dark: {
          950: '#040406',
          900: '#090a0d',
          850: '#0f1015',
          800: '#15171e',
          750: '#1d1f28',
          700: '#262935',
          600: '#363a4b',
          500: '#4b5065',
        },
      },
      boxShadow: {
        'glow-brand': '0 0 35px -5px rgba(212, 184, 124, 0.35)',
        'glow-brand-lg': '0 0 60px -10px rgba(212, 184, 124, 0.45)',
        card: '0 10px 30px -10px rgba(0, 0, 0, 0.85)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'zoom-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out both',
        'slide-up': 'slide-up 0.4s ease-out both',
        'zoom-in': 'zoom-in 0.25s ease-out both',
        shake: 'shake 0.4s ease-in-out both',
      },
    },
  },
  plugins: [],
}
