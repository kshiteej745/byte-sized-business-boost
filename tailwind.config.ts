import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff5f0',
          100: '#ffe8d8',
          200: '#ffcfb0',
          300: '#ffac7e',
          400: '#ff7f4d',
          500: '#ff5c1f',
          600: '#f0470c',
          700: '#c8380a',
          800: '#9f2e0f',
          900: '#802910',
        },
        warm: {
          50: '#faf7f4',
          100: '#f5efe8',
          200: '#e8dcd0',
          300: '#d9c5b1',
          400: '#c8a989',
        },
      },
      fontFamily: {
        sans: ['var(--font-lato)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-work-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
}
export default config
