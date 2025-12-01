/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem'
      }
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular']
      },
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#b9e6fe',
          300: '#7cd4fd',
          400: '#36c0fb',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e'
        },
        accent: {
          50: '#fdf5ff',
          100: '#f8e8ff',
          200: '#f0d1fe',
          300: '#e4b3fc',
          400: '#d186f9',
          500: '#be55f4',
          600: '#a234db',
          700: '#8529b7',
          800: '#6c238f',
          900: '#571d73'
        },
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827'
        },
        success: '#16a34a',
        warning: '#f59e0b',
        danger: '#dc2626',
        info: '#0ea5e9'
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0,0,0,0.05)',
        soft: '0 2px 4px -2px rgba(0,0,0,0.06), 0 4px 6px -1px rgba(0,0,0,0.10)',
        elevated: '0 8px 12px -3px rgba(0,0,0,0.15)',
        glass: '0 4px 20px rgba(0,0,0,0.08)'
      },
      borderRadius: {
        xs: '0.125rem',
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        pill: '9999px'
      },
      spacing: {
        '4.5': '1.125rem',
        '18': '4.5rem',
        '22': '5.5rem'
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
        'slide-up': 'slide-up 0.35s ease-out'
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        'slide-up': {
          '0%': { opacity: 0, transform: 'translateY(4px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: [
    function({ addBase, theme }) {
      addBase({
        'html': { fontFamily: theme('fontFamily.sans'), backgroundColor: theme('colors.neutral.50'), color: theme('colors.neutral.800') },
        'h1': { fontSize: '2.25rem', fontWeight: '700', letterSpacing: '-0.02em' },
        'h2': { fontSize: '1.875rem', fontWeight: '600', letterSpacing: '-0.01em' },
        'h3': { fontSize: '1.5rem', fontWeight: '600' },
        'h4': { fontSize: '1.25rem', fontWeight: '600' },
        'p': { lineHeight: '1.6' }
      });
    }
  ]
};
