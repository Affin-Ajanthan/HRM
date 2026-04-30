/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Primary Brand — deep indigo
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Deep navy sidebar
        navy: {
          800: '#0f172a',
          850: '#0d1526',
          900: '#0a1120',
          950: '#060d18',
        },
        // HR accent — teal
        teal: {
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
        // Employee accent — sky
        sky: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        // Success
        success: {
          50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0',
          600: '#16a34a', 700: '#15803d', 800: '#166534',
        },
        // Warning
        warning: {
          50: '#fffbeb', 100: '#fef3c7',
          600: '#d97706', 700: '#b45309',
        },
        // Danger
        danger: {
          50: '#fef2f2', 100: '#fee2e2',
          600: '#dc2626', 700: '#b91c1c',
        },
      },
      boxShadow: {
        'premium': '0 4px 24px rgba(99,102,241,0.15), 0 1px 4px rgba(0,0,0,0.08)',
        'glow-indigo': '0 0 20px rgba(99,102,241,0.4)',
        'glow-teal': '0 0 20px rgba(20,184,166,0.4)',
        'glow-sky': '0 0 20px rgba(14,165,233,0.4)',
        'card': '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        'fade-in': { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'slide-in': { '0%': { opacity: '0', transform: 'translateX(-16px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        'count-up': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'shimmer': { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'pulse-ring': { '0%, 100%': { boxShadow: '0 0 0 0 rgba(99,102,241,0.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(99,102,241,0)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'slide-in': 'slide-in 0.3s ease-out both',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-ring': 'pulse-ring 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}