/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Luxury Champagne Gold palette
        brand: {
          50: '#faf8f2',
          100: '#f4eedd',
          200: '#eadbba',
          300: '#dec693',
          400: '#d4b87c', // Primary Champagne Gold highlight & text
          500: '#c5a358', // Core Champagne Gold
          600: '#ab883f', // Deep Champagne Gold
          700: '#8c6d2d',
          800: '#6b5220',
          900: '#4b3814',
          950: '#291e0a',
        },
        // Premium Caviar / Obsidian Black surfaces
        dark: {
          950: '#040406', // Pure deep luxury black background
          900: '#090a0d', // Luxury card & container base
          850: '#0f1015', // Interactive card surface
          800: '#15171e', // Elevated pills and surfaces
          750: '#1d1f28', // Fine luxury border
          700: '#262935', // Accent border / rings
          600: '#363a4b', // Secondary borders
          500: '#4b5065', // Muted slate text
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
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        radar: {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out both',
        'slide-up': 'slide-up 0.4s ease-out both',
        'zoom-in': 'zoom-in 0.25s ease-out both',
        shake: 'shake 0.4s ease-in-out both',
        float: 'float 4s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        radar: 'radar 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        shimmer: 'shimmer 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
