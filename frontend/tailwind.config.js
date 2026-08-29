/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        crop: { 50: "#f2faf3", 100: "#e3f5e4", 500: "#4caf50", 600: "#43a047", 700: "#388e3c" }
      },
      boxShadow: { soft: "0 2px 8px rgba(0,0,0,.08)" }
    }
  },
  plugins: []
};
