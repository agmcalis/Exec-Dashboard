/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Premier's primary typeface
        sans: ['"Inter Tight"', 'system-ui', 'sans-serif'],
        condensed: ['"Roboto Condensed"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Backgrounds — Premier navy darkened for dashboard use
        bg:          '#071624',   // deepest background
        surface:     '#0C2035',   // card / panel surface
        'surface-2': '#103454',   // Premier's exact dark blue — elevated surface
        'surface-3': '#164a76',   // hover / selected states
        border:      'rgba(255,255,255,0.07)',
        'border-hi': 'rgba(255,255,255,0.14)',

        // Premier accent — their CTA / brand blue
        premier:         '#24a3e3',
        'premier-hover': '#1a8fcc',
        'premier-light': '#a3d7ef',
        'premier-muted': 'rgba(36,163,227,0.12)',

        // Semantic
        better:      '#22c55e',
        'better-bg': 'rgba(34,197,94,0.10)',
        worse:       '#ef4444',
        'worse-bg':  'rgba(239,68,68,0.10)',
        neutral:     '#64748b',
      },
      animation: {
        'fade-up':   'fadeUp 0.45s ease-out both',
        'fade-in':   'fadeIn 0.3s ease-out both',
        'slide-right': 'slideRight 0.35s ease-out both',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideRight: {
          from: { opacity: '0', transform: 'translateX(-10px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
