/** @type {import('tailwindcss').Config} */
const terra = {
  50: '#FBF3EF', 100: '#F9EDE8', 200: '#F0D9CF', 300: '#E8D0C5', 400: '#C97E68',
  500: '#A6452F', 600: '#8C3322', 700: '#73281B', 800: '#5C2016', 900: '#451811', 950: '#2E100B',
  DEFAULT: '#8C3322', foreground: '#FAF8F5',
};
const ink = {
  50: '#FAF8F5', 100: '#F4F0E8', 200: '#E7E2D7', 300: '#D5CEBF', 400: '#A8A090',
  500: '#78716C', 600: '#57534E', 700: '#44403C', 800: '#292524', 900: '#1C1917', 950: '#0C0A09',
  DEFAULT: '#1C1917',
};
const moss = {
  50: '#F3F7F3', 100: '#EEF5F0', 200: '#D6E6DA', 300: '#B3CFBA', 400: '#7FA88A',
  500: '#4E7D5B', 600: '#3B6847', 700: '#2D5A3A', 800: '#244A2F', 900: '#1C3A25', 950: '#0F2015',
};
const ochre = {
  50: '#FCF8F0', 100: '#FAF5EA', 200: '#F1E4C6', 300: '#E5CE98', 400: '#D2AE5E',
  500: '#B8892F', 600: '#8A5A00', 700: '#704900', 800: '#5A3B00', 900: '#452D00', 950: '#2B1C00',
};
const rust = {
  50: '#FDF2F2', 100: '#FBE6E4', 200: '#F3C8C4', 300: '#E6A19A', 400: '#D06D63',
  500: '#B5463B', 600: '#991B1B', 700: '#7F1717', 800: '#661313', 900: '#4D0F0F', 950: '#330A0A',
};
const slateBlue = {
  50: '#F3F6F9', 100: '#F0F4F8', 200: '#D9E2EC', 300: '#B6C6D6', 400: '#7F97B0',
  500: '#56708C', 600: '#3D5A78', 700: '#2B4C6F', 800: '#233E5B', 900: '#1B3047', 950: '#101D2B',
};

module.exports = {
  blocklist: ['overline'],
  darkMode: ['class'],
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        white: '#FFFDF9',
        black: '#0C0A09',
        paper: '#FBF9F5',
        surface: { DEFAULT: '#F4F0E8', hover: '#EFEAE0' },
        rule: '#E7E2D7',
        ink,
        terra,
        slate: ink, gray: ink, zinc: ink, neutral: ink, stone: ink,
        primary: terra,
        accent: terra,
        blue: slateBlue, sky: slateBlue, indigo: slateBlue, cyan: slateBlue,
        purple: terra, violet: terra, fuchsia: terra, pink: terra, rose: rust,
        teal: moss, emerald: moss, green: moss, lime: moss,
        amber: ochre, yellow: ochre, orange: ochre,
        red: rust,
        danger: { DEFAULT: '#991B1B', 600: '#991B1B', 50: '#FDF2F2' },
        neon: { cyan: '#8C3322', blue: '#8C3322', purple: '#8C3322', pink: '#8C3322' },
        nexus: { 900: '#1C1917', 800: '#292524', 700: '#44403C', 600: '#57534E', 500: '#78716C' },
        bgLight: '#FBF9F5',
        bgDark: '#FBF9F5',
        cardDark: '#FFFDF9',
        text: { dim: '#78716C', muted: '#78716C' },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'sans-serif'],
        display: ['"Newsreader"', 'Georgia', 'serif'],
        serif: ['"Newsreader"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-sm': ['2.25rem', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        'display-md': ['3rem', { lineHeight: '1.05', letterSpacing: '-0.015em' }],
        'display-lg': ['4.25rem', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        'display-xl': ['5rem', { lineHeight: '1', letterSpacing: '-0.025em' }],
      },
      boxShadow: {
        sm: '0 1px 2px rgba(28,25,23,0.04)',
        DEFAULT: '0 2px 12px -2px rgba(28,25,23,0.05)',
        md: '0 4px 20px -4px rgba(28,25,23,0.06)',
        lg: '0 8px 28px -8px rgba(28,25,23,0.08)',
        xl: '0 12px 32px -8px rgba(28,25,23,0.10)',
        '2xl': '0 16px 40px -12px rgba(28,25,23,0.12)',
        soft: '0 2px 12px -2px rgba(28,25,23,0.04)',
        card: '0 4px 20px -4px rgba(28,25,23,0.06)',
        elevated: '0 12px 32px -8px rgba(28,25,23,0.10)',
        floating: '0 12px 32px -8px rgba(28,25,23,0.12)',
        glow: '0 2px 12px -2px rgba(28,25,23,0.06)',
        'glow-cyan': '0 2px 12px -2px rgba(28,25,23,0.06)',
        'glow-purple': '0 2px 12px -2px rgba(28,25,23,0.06)',
        'inner-glow': 'none',
        none: 'none',
      },
      borderRadius: {
        lg: '0.5rem', md: '0.375rem', sm: '0.25rem',
        xl: '0.75rem', '2xl': '0.875rem', '3xl': '1rem', '4xl': '1.25rem', full: '9999px',
      },
      backdropBlur: { xs: '2px', '3xl': '24px' },
      animation: {
        'float': 'none', 'float-slow': 'none', 'float-fast': 'none', 'pulse-glow': 'none', 'blob': 'none',
        'pulse-slow': 'pulseSlow 3.5s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s cubic-bezier(.2,.7,.2,1) both',
        'fade-in': 'fadeIn 0.5s ease-out both',
        'marquee': 'marquee 60s linear infinite',
        'spin-slow': 'spin 12s linear infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      keyframes: {
        pulseSlow: { '0%, 100%': { opacity: '0.65' }, '50%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
