/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Core palette
        navy:    { DEFAULT: '#0A0F1E', 50: '#f0f1f5', 100: '#d1d4e0', 200: '#a3a9c2', 300: '#747ea3', 400: '#465385', 500: '#172866', 600: '#111e4d', 700: '#0c1539', 800: '#070d26', 900: '#030612' },
        indigo:  { DEFAULT: '#5B5FEF', 50: '#eeeeff', 100: '#d4d5fc', 200: '#aaabf9', 300: '#8082f6', 400: '#5B5FEF', 500: '#4346d4', 600: '#3335b8', 700: '#25279c', 800: '#191a7f', 900: '#0f1063' },
        surface: { DEFAULT: '#111827', card: '#1a2235', border: '#1f2d45', hover: '#1e2d42' },
        text:    { primary: '#f0f4ff', secondary: '#8fa3bf', muted: '#4a6080' },
        success: '#22c55e',
        warning: '#f59e0b',
        danger:  '#ef4444',
        premium: '#f59e0b',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        card:    '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'card-hover': '0 8px 30px rgba(91,95,239,0.15), 0 1px 3px rgba(0,0,0,0.4)',
        glow:    '0 0 20px rgba(91,95,239,0.35)',
        'glow-sm': '0 0 10px rgba(91,95,239,0.25)',
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231f2d45' fill-opacity='0.6'%3E%3Cpath d='M0 0h1v40H0V0zm40 0h-1v40h1V0zM0 0v1h40V0H0zm0 40v-1h40v1H0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease forwards',
        'slide-up':   'slideUp 0.4s ease forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':    'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
};