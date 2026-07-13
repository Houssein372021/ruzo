/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-body)'],
        body: ['var(--font-body)'],
      },
      maxWidth: {
        '300': '1200px',
      },
    },
  },
  plugins: [],
};
