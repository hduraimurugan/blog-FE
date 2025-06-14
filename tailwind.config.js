// tailwind.config.js
import typography from '@tailwindcss/typography'
/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
     extend: {
       fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        lato: ['Lato', 'sans-serif'],
        playfair: ['"Playfair Display"', 'serif'],
        yesteryear: ['Yesteryear', 'cursive'],
        bonheur: ['"Bonheur Royale"', 'cursive'],
      },
    },
  },
  plugins: [
    typography,
     require('daisyui'), // ✅ Add daisyui plugin
  ],
}
