/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#FA243C',
          hover: '#FF3B4F',
          pressed: '#D91E33',
        },
        'accent-text': 'rgb(var(--accent-text) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          elevated: 'rgb(var(--surface-elevated) / <alpha-value>)',
          raised: 'rgb(var(--surface-raised) / <alpha-value>)',
        },
        label: {
          DEFAULT: 'rgb(var(--label) / <alpha-value>)',
          secondary: 'var(--label-secondary)',
        },
        separator: 'var(--separator)',
        error: 'rgb(var(--error) / <alpha-value>)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
      },
      fontSize: {
        'large-title': ['34px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        title: ['28px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        section: ['22px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        body: ['15px', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        track: ['13px', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        caption: ['12px', { lineHeight: '1.5', letterSpacing: '-0.01em' }],
        lyric: ['40px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'lyric-sm': ['28px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
      },
      borderRadius: {
        art: '8px',
        'art-lg': '10px',
        tile: '12px',
        panel: '14px',
        pill: '999px',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
