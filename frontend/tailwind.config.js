/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  
    container: {
      center: true,
      padding: '2rem',
      screens: {
        sm: "100%",
        md: "100%",
        lg: "1024px",
        xl: "1280px",
        '2xl': "1536px",
      },

    extend: {
      fontFamily : {
        poppins: ["Poppins", "sans-serif"],
      }
    },
  },
  plugins: [],
}

}