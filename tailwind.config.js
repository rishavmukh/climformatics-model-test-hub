/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          50: '#eef6ff',
          100: '#dbeafe',
          400: '#4a9eea',
          500: '#2a78d6',
          600: '#1c5cab',
          700: '#184f95',
        },
        ink: {
          primary: '#0b0b0b',
          secondary: '#52514e',
          muted: '#898781',
        },
        surface: {
          page: '#f9f9f7',
          card: '#ffffff',
          sunken: '#fcfcfb',
        },
        hairline: '#e1e0d9',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(11,11,11,0.04), 0 1px 3px 0 rgba(11,11,11,0.06)',
      },
    },
  },
  plugins: [],
};
