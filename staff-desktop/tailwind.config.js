/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark red: bold identity on black
        brand: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        // Pure black base, white text
        dark: {
          950: '#000000',
          900: '#060606',
          850: '#0b0b0b',
          800: '#121212',
          750: '#1a1a1a',
          700: '#232323',
          600: '#2f2f2f',
          500: '#3d3d3d',
        },
      },
      boxShadow: {
        'glow-brand': '0 0 40px -10px rgba(220, 38, 38, 0.45)',
        card: '0 8px 30px -6px rgba(0, 0, 0, 0.6)',
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
