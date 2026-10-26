/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f9',
          100: '#e1e9f2',
          200: '#c3d3e6',
          300: '#94b3d3',
          400: '#5e8ebd',
          500: '#386fa4',
          600: '#275788',
          700: '#20466e',
          800: '#1c3b5d',
          900: '#0f1f33',
          950: '#0a1422',
        },
        brand: {
          indigo: '#4f46e5',
          teal: '#0d9488',
          cyan: '#06b6d4',
          amber: '#f59e0b',
          rose: '#f43f5e',
          emerald: '#10b981'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 0 0 1px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04)',
        'card-hover': '0 0 0 1px rgba(99,102,241,0.2), 0 8px 24px -4px rgba(15,23,42,0.08)'
      }
    },
  },
  plugins: [],
}
