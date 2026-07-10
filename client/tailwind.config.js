/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        game: {
          green: '#00ff00',
          dark: '#1a1a1a',
          accent: '#00cc00',
        }
      }
    },
  },
  plugins: [],
}
