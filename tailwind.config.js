/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    // Add other pages here when they migrate off the CDN.
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
