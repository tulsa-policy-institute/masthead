const defaultTheme = require('tailwindcss/defaultTheme')

const CUSTOM_COLORS = {
  'tpi-blue': '#00AAAD',
  'tpi-green': '#00AAAD',
  'tpi-purple': '#9747FF',
  'tpi-orange': '#FF5C00',
  'tpi-pink': '#FF8BE6',
};
const TARGET_SAFELIST_TAILWIND_PREFIXES = ['from-', 'bg-'];

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  purge: {
    safelist: [
      // "multiples" the custom colors against other prefix modifier tailwind classes
      ...Object.keys(CUSTOM_COLORS)
        .map(c => [c, ...TARGET_SAFELIST_TAILWIND_PREFIXES.map(p => `${p}${c}`)])
        .reduce((a, c) => [...a, ...c]),
    ],
  },
  theme: {
    extend: {
      colors: {
        ...CUSTOM_COLORS,
      },
      fontFamily: {
        'sans': ['Plus Jakarta Sans', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}
