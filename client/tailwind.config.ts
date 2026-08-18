import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        atlas: {
          bg: '#0B0E14',
          panel: '#12161F',
          surface: '#171C27',
          border: '#1E2533',
          parchment: '#E8DFC8',
          brass: '#C9A15C',
          'brass-hover': '#D8B26C',
          text: '#EDEAE0',
          muted: '#8B93A3',
          subtle: '#565D6E',
        },
      },
      fontFamily: {
        serif: ['"Iowan Old Style"', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
