/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf2ee',
          100: '#f9e0d6',
          200: '#f2bcac',
          300: '#e8907a',
          400: '#d95f3f',
          500: '#c0401e',
          600: '#a03215',
          700: '#7e2710',
          800: '#661f0c',
          900: '#531808',
          950: '#2e0d04',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
