/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/**/*.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#3b6ed5',
          light: '#5581d9',
        }
      }
    },
    screens: {
      'xxs': '350px',
      'xs': '400px',
      'sm': '640'
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ]
}
