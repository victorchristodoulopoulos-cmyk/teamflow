/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"] },
      boxShadow: {
        soft: "0 1px 0 rgba(255,255,255,0.06), 0 12px 34px rgba(0,0,0,0.38)",
        strong: "0 22px 80px rgba(0,0,0,0.60)",
      },
    },
  },
  plugins: [],
};
