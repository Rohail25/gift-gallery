// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Luxury palette using CSS variables defined in globals.css
        "bg-primary": "var(--bg-primary)",
        "bg-secondary": "var(--bg-secondary)",
        "bg-card": "var(--bg-card)",
        "gold-primary": "var(--gold-primary)",
        "gold-light": "var(--gold-light)",
        "gold-dark": "var(--gold-dark)",
        "rose-gold": "var(--rose-gold)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "border-custom": "var(--border-custom)",
        "footer-bg": "var(--footer-bg)",
        "footer-text": "var(--footer-text)",
      },
      fontFamily: {
        luxury: [
          '"Playfair Display"',
          'Georgia',
          '"Times New Roman"',
          'serif',
        ],
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
