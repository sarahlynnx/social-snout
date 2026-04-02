/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#F4F7F4",
          100: "#E2EBE0",
          200: "#C5D7C0",
          300: "#9DBC95",
          400: "#74A169",
          500: "#5A8A4F",
          600: "#476E3E",
          700: "#375530",
          800: "#2B4326",
          900: "#1F311B",
        },
        secondary: {
          50: "#FDF6F2",
          100: "#FAEBE0",
          200: "#F3D3BF",
          300: "#E8B599",
          400: "#D9936F",
          500: "#C4754A",
          600: "#A85E38",
          700: "#874A2C",
          800: "#6B3A22",
          900: "#4F2B19",
        },
        accent: {
          50: "#FFFBF0",
          100: "#FFF4D9",
          200: "#FFE8AD",
          300: "#FFDA7A",
          400: "#FFC94A",
          500: "#F5B31E",
        },
        gray: {
          50: "#FAFAF7",
          100: "#F5F4F0",
          200: "#E8E6E1",
          300: "#D4D1CA",
          400: "#A8A49C",
          500: "#7D796F",
          600: "#5C584F",
          700: "#3D3A33",
          800: "#272520",
          900: "#1A1815",
        },
      },
    },
  },
  plugins: [],
};
