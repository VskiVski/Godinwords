/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fbeef0',
          100: '#f6dbdf',
          200: '#eebac2',
          300: '#e293a0',
          400: '#d1637a',
          500: '#b83c56',
          600: '#992c44',
          700: '#7a2337',
          800: '#611d2e',
          900: '#4f1a27',
          950: '#2c0d15',
        },
        secondary: {
          50: '#f2f5f8',
          100: '#e2e9f0',
          200: '#c3d1e0',
          300: '#99b3cb',
          400: '#6b8fb0',
          500: '#4a7093',
          600: '#375777',
          700: '#2d465f',
          800: '#26394d',
          900: '#1f2e3f',
          950: '#131c28',
        },
        gold: {
          50: '#fdf9ec',
          100: '#faf0cc',
          200: '#f4de9a',
          300: '#edc766',
          400: '#e3ac3d',
          500: '#d18f27',
          600: '#b06f1d',
          700: '#8c561c',
          800: '#73451c',
          900: '#603a1c',
        },
      },
    },
  },
  plugins: [],
};
