/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        discord: {
          dark: '#36393f',
          darker: '#2f3136',
          darkest: '#202225',
          input: '#40444b',
          hover: '#33353b',
          blue: '#5865F2',
          'blue-hover': '#4752C4',
          gray: '#b9bbbe',
          text: '#dcddde',
          muted: '#72767d',
        }
      },
      animation: {
        'typing': 'typing 1.4s ease-in-out infinite',
      },
      keyframes: {
        typing: {
          '0%, 60%, 100%': { opacity: '0' },
          '30%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}