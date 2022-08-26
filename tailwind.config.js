const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tpi-blue': '#00AAAD',
      },
      fontFamily: {
        'sans': ['Plus Jakarta Sans', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}
