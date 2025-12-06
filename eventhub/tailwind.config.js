/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6",
        secondary: "#10b981",
        accent: "#f97316",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(0,0,0,0.06)",
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "fadeInUp": "fadeInUp 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
}
