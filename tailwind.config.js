/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.svelte', './src/**/*.html'],
  darkMode: false,
  theme: {
    extend: {
      height: {
        '600px': '600px'
      },
      width: {
        '400px': '400px',
        '500px': '500px',
        '600px': '600px'
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
