/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#00BFA6",
        accent: "#D2FDF7",
        black: {
          100: "#282828",
          150: "#1B1B1B",
          200: "#3D3D3D",
        },
        gray: {
          100: "#5C5C5C",
          150: "#E0E0E0",
          700: "#414651",
        },
      },
      fontFamily: {
        roboto: ["RobotoRegular"],
        "roboto-medium": ["RobotoMedium"],
        "roboto-bold": ["RobotoBold"],
      },
      boxShadow: {
        custom: "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",
        nav: "0px 4px 25px rgba(0,0,0,0.17)",
      },
    },
  },
  plugins: [],
};
