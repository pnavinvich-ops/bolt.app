/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B0B0F',
        surface: '#14141B',
        surfaceAlt: '#1C1C26',
        surfaceHigh: '#24242F',
        border: '#2A2A36',
        borderStrong: '#3A3A48',
        text: {
          DEFAULT: '#F5F5F7',
          dim: '#B8B8C2',
          faint: '#7A7A85',
        },
        onAccent: '#0B0B0F',
        accent: {
          DEFAULT: '#FF5A1F',
          hi: '#FF7A4A',
          lo: '#3A1A0E',
        },
        ok: {
          DEFAULT: '#3DDC97',
          tint: 'rgba(61, 220, 151, 0.14)',
        },
        warn: {
          DEFAULT: '#FFD166',
          tint: 'rgba(255, 209, 102, 0.14)',
        },
        bad: {
          DEFAULT: '#EF476F',
          tint: 'rgba(239, 71, 111, 0.14)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        display: ['34px', { lineHeight: '1.2', fontWeight: '800' }],
        h1: ['28px', { lineHeight: '1.2', fontWeight: '800' }],
        h2: ['20px', { lineHeight: '1.2', fontWeight: '700' }],
        h3: ['16px', { lineHeight: '1.3', fontWeight: '700' }],
        body: ['15px', { lineHeight: '1.5', fontWeight: '500' }],
        caption: ['12px', { lineHeight: '1.4', fontWeight: '600' }],
        micro: ['11px', { lineHeight: '1.4', fontWeight: '600' }],
      },
      borderRadius: {
        xs: '6px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        pill: '9999px',
      },
      spacing: {
        '4.5': '18px',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
