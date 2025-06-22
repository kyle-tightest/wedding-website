/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fefdf7',
          100: '#fdf8e7',
          200: '#f9ebbb',
          300: '#f5dd8f',
          400: '#ecc237',
          500: '#eab308',
          600: '#d2a107',
          700: '#af8606',
          800: '#8c6b04',
          900: '#735803',
        },
      },
      transitionDuration: {
        '1000': '1000ms',
        '2000': '2000ms',
      },
      transitionDelay: {
        '200': '200ms',
        '400': '400ms',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      fontFamily: {
        // If you have an existing 'script' font or others, keep them
        // script: ['YourScriptFontName', 'cursive'], // Example of an existing font
        'olive': ['Olive', 'sans-serif'], // Add your new font here
                                         // 'Olive' matches the font-family in @font-face
                                         // 'sans-serif' is a fallback font
        'lagagliane': ['LaGagliane', 'sans-serif'],
        'sispectlyharmonies': ['SispectlyHarmonies', 'sans-serif'],
        'sispectlyharmoniesitalic': ['SispectlyHarmoniesItalic', 'sans-serif'],
        'soul': ['Soul', 'sans-serif'],
        'baskerville': ['Baskerville', 'sans-serif']
      },
    },
  },
  plugins: [],
};