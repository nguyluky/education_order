/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef8ff',
          100: '#d9eeff',
          200: '#bce0ff',
          300: '#8acaff',
          400: '#54adff',
          500: '#2c8cff',
          600: '#116cff',
          700: '#0056e6',
          800: '#0447ba',
          900: '#093d94',
          950: '#06265d',
        },
        secondary: {
          50: '#f2f8fd',
          100: '#e3effb',
          200: '#c1def6',
          300: '#8ac6ef',
          400: '#4ca9e4',
          500: '#278bd3',
          600: '#186fb4',
          700: '#155993',
          800: '#164a7a',
          900: '#173f66',
          950: '#102945',
        },
      },
    },
  },
  plugins: [],
}