/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          primary: "#0D253F",
          dark: "#08182B",
        },
        blue: {
          action: "#00BFA5",
          light: "#E3F2FD",
        },
        teal: {
          accent: "#03DAC5",
        },
        surface: {
          card: "#FFFFFF",
          background: "#F0F4F8",
        },
        text: {
          primary: "#102027",
          secondary: "#546E7A",
        },
        status: {
          success: "#2E7D32",
          warning: "#EF6C00",
          error: "#C62828",
        }
      },
    },
  },
  plugins: [],
}