/** @type {import('tailwindcss').Config} */
import flowbite from "flowbite-react/tailwind";
export const content = [
  "./pages/**/*.{mjs,js,ts,jsx,tsx,mdx}",
  "./components/**/*.{mjs,js,ts,jsx,tsx,mdx}",
  "./app/**/*.{mjs,js,ts,jsx,tsx,mdx}",
  "./node_modules/flowbite/**/*.js",
  flowbite.content(),
];
export const theme = {
  extend: {
    backgroundImage: {
      "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
    },
  },
};
export const plugins = [
  flowbite.plugin()
];
