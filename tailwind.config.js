/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/**/*.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: '#6785c1',
          light: '#7198ce',
          lighter: '#9cb4dc'
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
