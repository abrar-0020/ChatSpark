/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm Modern Theme - Orange/Amber Accents
        primary: {
          DEFAULT: '#FF6B35', // Vibrant Orange
          hover: '#E85A2A',
          light: '#FF8555',
          dark: '#CC5528'
        },
        accent: {
          DEFAULT: '#FFB84D', // Golden Amber
          hover: '#F0A838',
          light: '#FFC873',
        },
        success: '#2ECC71', // Keep success green for clarity
        warning: '#F39C12', // Amber warning
        danger: '#E74C3C', // Red danger
        info: '#FFB84D', // Amber instead of blue
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          850: '#1C1C1C',
          900: '#171717',
          950: '#0F0F0F'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.15)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.2)',
        'hard': '0 8px 32px rgba(0, 0, 0, 0.25)',
        'glow': '0 0 20px rgba(255, 107, 53, 0.3)',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.25s ease-out',
      },
    },
  },
  plugins: [],
}
