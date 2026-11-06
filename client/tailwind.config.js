/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0b0b0b', 800: '#1a1a1a', 700: '#2b2b2b', 600: '#4a4a4a', 500: '#6b6b6b', 400: '#9a9a9a', 300: '#c9c9c9', 200: '#e5e5e5', 100: '#f2f2f2', 50: '#f8f8f8' },
        cream: { DEFAULT: '#f7f4ee', 50: '#fbfaf7', 100: '#f7f4ee', 200: '#efe9df', 300: '#e2d9c9' },
        brass: { DEFAULT: '#b7791f', 50: '#fbf4e6', 100: '#f5e5c2', 200: '#ebcc85', 300: '#deb04f', 400: '#cf962f', 500: '#b7791f', 600: '#945f19', 700: '#704713', 800: '#4c300d' },
        brick: { DEFAULT: '#c2410c', 50: '#fdf1ea', 100: '#f9dccb', 500: '#c2410c', 600: '#9a3412' },
        good: '#0ca30c',
        warn: '#fab219',
        serious: '#ec835a',
        critical: '#d03b3b',
      },
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
        lift: '0 12px 40px rgba(0,0,0,0.14)',
      },
      keyframes: {
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        slideIn: { '0%': { transform: 'translateX(100%)' }, '100%': { transform: 'translateX(0)' } },
        slideInLeft: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(0)' } },
        pop: { '0%': { transform: 'scale(0.96)', opacity: 0 }, '100%': { transform: 'scale(1)', opacity: 1 } },
        shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        fadeUp: 'fadeUp .4s ease-out both',
        slideIn: 'slideIn .3s cubic-bezier(.2,.8,.2,1) both',
        slideInLeft: 'slideInLeft .3s cubic-bezier(.2,.8,.2,1) both',
        pop: 'pop .2s ease-out both',
        shimmer: 'shimmer 1.4s linear infinite',
      },
    },
  },
  plugins: [],
};
