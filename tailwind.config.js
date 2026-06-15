/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: '#0A1628',
        secondary: '#111D2E',
        card: '#152238',
        'card-hover': '#1A2B45',
        border: '#1E3A5F',
        cyan: {
          DEFAULT: '#00D4FF',
          dark: '#0091EA',
        },
        success: '#00E676',
        warning: '#FF9100',
        danger: '#FF1744',
        purple: '#B388FF',
        text: {
          primary: '#E8F0FE',
          secondary: '#8BA3C7',
          muted: '#5A7A9E',
        },
      },
    },
  },
  plugins: [],
};
