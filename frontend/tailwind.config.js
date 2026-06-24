/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "rgb(var(--border) / <alpha-value>)",
        background: "rgb(var(--bg-primary) / <alpha-value>)",
        foreground: "rgb(var(--text-primary) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--accent-1) / <alpha-value>)",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "rgb(var(--accent-2) / <alpha-value>)",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "rgb(var(--bg-secondary) / <alpha-value>)",
          foreground: "rgb(var(--text-muted) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent-3) / <alpha-value>)",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "rgb(var(--bg-card) / <alpha-value>)",
          foreground: "rgb(var(--text-primary) / <alpha-value>)",
        },
        violet: {
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
        },
        success: "rgb(var(--accent-success) / <alpha-value>)",
        warning: "rgb(var(--accent-warning) / <alpha-value>)",
        danger: "rgb(var(--accent-danger) / <alpha-value>)",
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        lg: 'var(--radius-lg)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        glow: 'var(--shadow-glow)',
        card: 'var(--shadow-card)',
        sm: 'var(--shadow-sm)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'scale-in': 'scaleIn 0.3s ease forwards',
        'float': 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 4s ease infinite',
        'spin-ring': 'spin-ring 1s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.35s ease forwards',
        'countdown-pulse': 'countdown-pulse 1s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgb(139 92 246 / 0.3)' },
          '50%': { boxShadow: '0 0 50px rgb(139 92 246 / 0.6)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'spin-ring': {
          from: { strokeDashoffset: '400' },
          to: { strokeDashoffset: 'var(--target-offset, 0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'countdown-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
    },
  },
  plugins: [],
}