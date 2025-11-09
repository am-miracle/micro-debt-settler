/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#00BFA6",
        black:{
          100: "#282828",
          200: "#3D3D3D",

        },gray:{
          100: "#5C5C5C",
          150: "#B0B0B0",
          200: "#E0E0E0",
          500: "#8C8C8C",
        }
      },
    },
  },
  plugins: [],
};
