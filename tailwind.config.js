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
        'tpi-green': '#00AAAD',
        'tpi-purple': '#9747FF',
        'tpi-orange': '#FF5C00',
        'tpi-pink': '#FF8BE6',
      },
      fontFamily: {
        'sans': ['Plus Jakarta Sans', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}
