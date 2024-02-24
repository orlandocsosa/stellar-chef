/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.svelte', './src/**/*.html'],
  darkMode: false,
  theme: {
    extend: {
      height: {
        '600px': '600px'
      },
      fontFamily: {
        lexend: ['Lexend', 'sans-serif']
      }
    }
  },
  variants: {
    extend: {
      textOverflow: ['ellipsis']
    }
  },
  plugins: []
};
