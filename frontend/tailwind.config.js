/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0B1120',
          900: '#111A2E',
          800: '#182238',
          700: '#26324A',
          600: '#3A4A66',
        },
        slate: {
          50: '#F6F7F9',
          100: '#EEF1F5',
          200: '#DFE4EB',
        },
        accent: {
          DEFAULT: '#0E7C86',
          light: '#12A5B0',
          dark: '#0A5C63',
        },
        amber: {
          DEFAULT: '#C6812B',
          light: '#F0B45B',
        },
        rose: {
          DEFAULT: '#B5495B',
          light: '#E07A8C',
        },
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(11, 17, 32, 0.06), 0 1px 3px rgba(11, 17, 32, 0.08)',
      },
    },
  },
  plugins: [],
}
