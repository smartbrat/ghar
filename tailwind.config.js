/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './main.js',
    // ⚠️ Add any new JS/HTML file that injects Tailwind classes here.
    // Tailwind purges classes it doesn't see in scanned files, which
    // silently breaks JS-inserted UI. If a chip/pill/list item ever
    // appears unstyled, this is the first place to look.
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
