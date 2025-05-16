/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        yesteryear: ['"Yesteryear"', 'cursive'],
        bonheur: ['"Bonheur Royale"', 'cursive'],
        poppins: ['"Poppins"', 'sans-serif'],
        roboto: ['"Roboto"', 'sans-serif'],
        montserrat: ['"Montserrat"', 'sans-serif'],
        lato: ['"Lato"', 'sans-serif'],
        playfair: ['"Playfair Display"', 'sans-serif'],
        futura: ['"Futura"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}