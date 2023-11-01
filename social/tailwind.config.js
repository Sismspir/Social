/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'picShadow': '2px 2px 8px 1px rgba(255, 255, 255, 0.8)',
        'btnShadow': '2px 2px 4px 1px rgba(255, 255, 255, 0.8)',
      },
    },
  },
  plugins: [],
}

