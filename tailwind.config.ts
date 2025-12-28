import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        line: "var(--line)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "chapter-accent": "var(--chapter-accent)",
        "status-good": "var(--status-good)",
        "status-normal": "var(--status-normal)",
        "status-amber": "var(--status-amber)",
        "status-danger": "var(--status-danger)",
        "reward-gold": "var(--reward-gold)",
        obsidian: "#0B0D10",
        graphite: "#12161C",
        mist: "#F6F4F0",
        slate: "#667085",
        "soft-gold": "#C7A76A",
        primary: {
          DEFAULT: "var(--chapter-accent)",
          foreground: "var(--background)",
        },
        secondary: {
          DEFAULT: "var(--surface)",
          foreground: "var(--foreground)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "var(--text-secondary)",
          foreground: "var(--text-secondary)",
        },
        accent: {
          DEFAULT: "var(--chapter-accent)",
          foreground: "var(--background)",
        },
        popover: {
          DEFAULT: "var(--background)",
          foreground: "var(--foreground)",
        },
        card: {
          DEFAULT: "var(--surface)",
          foreground: "var(--text-primary)",
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config

