/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './main.js',
    // main.js adds Tailwind utility classes to chips/pills dynamically
    // (e.g. .chip-el classes in renderChips). Without it in the scan,
    // purge strips bg-gray-100, px-2, py-0.5, etc. from the build and
    // dynamically-inserted pills lose their visual style.
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Gazpacho', 'Georgia', 'serif'],
      },
      colors: {
        red: {
          DEFAULT: '#ee324b',
          hover: '#d42839',
        },
        tx: '#141414',
        mu: '#6b7280',
        ln: '#e5e7eb',
      },
    },
  },
  plugins: [],
};
