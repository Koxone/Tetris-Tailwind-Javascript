/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js,jsx,ts,tsx,vue,svelte}"],
  safelist: ["font-worksans"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        monaspace: ["Monaspace", "monospace"],
        worksans: ["worksans", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};
