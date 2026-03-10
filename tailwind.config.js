/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'ui-sans-serif', 'sans-serif'],
      },
      colors: {
        campus: {
          primary: '#2563EB',
          secondary: '#16A34A',
          dark: '#020617',
        },
      },
    },
  },
  plugins: [],
}

