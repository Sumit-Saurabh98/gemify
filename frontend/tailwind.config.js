/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'gaming-purple': '#8B5CF6',
        'gaming-blue': '#3B82F6',
        'gaming-green': '#10B981',
        'gaming-dark': '#0F172A',
        'gaming-darker': '#020617',
      },
      fontFamily: {
        'gaming': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
