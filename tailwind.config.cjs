/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './**/*.html',
    '!./node_modules/**',
  ],
  theme: {
    extend: {
      colors: {
        'brand-magenta': '#D9006C',
        'brand-black': '#000000',
        'brand-gray-light': '#94A3B8',
        'brand-gray-medium': '#64748B',
        'brand-gray-dark': '#334155',
        'brand-gray-darker': '#1E293B',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
