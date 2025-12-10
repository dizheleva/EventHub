/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#ec4899",
        secondary: "#f59e0b",
        accent: "#8b5cf6",
        success: "#10b981",
        sky: "#06b6d4",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        color: "0 10px 25px -5px rgba(236, 72, 153, 0.3)",
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        zoomIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "fadeInUp": "fadeInUp 0.4s ease-out forwards",
        "fadeIn": "fadeIn 0.5s ease-out forwards",
        "zoomIn": "zoomIn 0.2s ease-out forwards",
      },
    },
  },
  plugins: [],
}

