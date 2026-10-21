/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F0F7FF',
          100: '#E0EFFE',
          200: '#BAE0FD',
          300: '#7CC6FA',
          400: '#3CA9F5',
          500: '#0EA5E9', // vivid sky
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
          950: '#082F49',
          DEFAULT: '#0EA5E9',
        },
        accent: {
          50: '#FCFDFF',
          100: '#F0F9FF',
          200: '#CCF3FE',
          300: '#93E6FD',
          400: '#56D1FF',
          500: '#14B8A6', // teal accent
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
          DEFAULT: '#14B8A6',
        },
        danger: {
          DEFAULT: '#EF4444',
          600: '#DC2626',
          50: '#FEF2F2',
        },
        bgLight: '#F8FAFC',
        bgDark: '#0B1021',
        cardLight: '#FFFFFF',
        cardDark: '#111827',
        glass: 'rgba(255, 255, 255, 0.55)',
        glassDark: 'rgba(17, 24, 39, 0.55)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Outfit"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'display-sm': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['3rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-lg': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'elevated': '0 20px 40px -10px rgba(14, 165, 233, 0.18), 0 8px 16px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 40px -10px rgba(14, 165, 233, 0.35)',
        'inner-glow': 'inset 0 0 20px rgba(255, 255, 255, 0.4)',
      },
      transformStyle: {
        '3d': 'preserve-3d',
        'flat': 'flat',
      },
      perspective: {
        '1000': '1000px',
        '1200': '1200px',
        '1500': '1500px',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        'full': '9999px',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'pulse-slow': 'pulseSlow 3.5s ease-in-out infinite',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'marquee': 'marquee 20s linear infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '0.65' },
          '50%': { opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4', boxShadow: '0 0 20px rgba(14, 165, 233, 0.2)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 60px rgba(14, 165, 233, 0.5)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
