/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 1. Tipografías (Para que se vea como en tus capturas)
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Sora", "sans-serif"], 
      },
      
      // 2. Paleta de Colores
      colors: {
        brand: {
          deep: '#0D1B2A',      // Azul muy oscuro (Fondo)
          surface: '#162032',   // Azul un poco más claro (Tarjetas)
          
          // AQUÍ ESTÁ EL TRUCO: 
          // Este color no es fijo. Depende de la variable CSS --accent 
          // que cambiaremos según si es Team, Family o Club.
          neon: 'var(--accent)', 
          
          platinum: '#E0E1DD',  // Texto blanco suave
          muted: '#778DA9',     // Texto gris azulado
        }
      },

      // 3. Texturas
      backgroundImage: {
        'carbon-pattern': "url('https://www.transparenttextures.com/patterns/carbon-fibre.png')",
      }
    },
  },
  plugins: [],
};