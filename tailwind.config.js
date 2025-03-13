/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#8860e6',
        dark: {
          100: '#444444',
          200: '#333333',
          300: '#2a2a2a',
          400: '#252525',
          500: '#1e1e1e',
          600: '#1a1a1a',
        }
      },
    },
  },
  plugins: [],
}