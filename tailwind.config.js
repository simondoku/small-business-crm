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
      screens: {
        'xs': '480px',
        // Default screens remain: sm:640px, md:768px, lg:1024px, xl:1280px
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      minHeight: {
        'screen-75': '75vh',
        'screen-50': '50vh',
      },
      maxHeight: {
        '0': '0',
        'screen-90': '90vh',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
    // Enable responsive typography
    fontSize: {
      'xs': ['0.75rem', { lineHeight: '1rem' }],
      'sm': ['0.875rem', { lineHeight: '1.25rem' }],
      'base': ['1rem', { lineHeight: '1.5rem' }],
      'lg': ['1.125rem', { lineHeight: '1.75rem' }],
      'xl': ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    },
  },
  plugins: [],
}