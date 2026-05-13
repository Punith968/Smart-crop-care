/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#10b981', // Emerald
        secondary: '#065f46', // Darker emerald
        accent: '#78350f', // Earthy brown
        background: '#f0fdf4', // Soft sage
      },
    },
  },
  plugins: [],
}
