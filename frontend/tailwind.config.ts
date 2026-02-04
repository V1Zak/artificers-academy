import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // MTG Mana Colors
        mana: {
          white: '#F8E7B9',
          blue: '#0E68AB',
          black: '#150B00',
          red: '#D3202A',
          green: '#00733E',
        },
        // Scroll/Parchment theme
        scroll: {
          bg: '#F5E6D3',
          border: '#8B7355',
          text: '#2C1810',
        },
        // UI accents
        arcane: {
          gold: '#C9A227',
          purple: '#6B3FA0',
          glow: '#FFD700',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
        display: ['Cinzel', 'serif'],
      },
      backgroundImage: {
        'scroll-texture': "url('/textures/parchment.png')",
      },
      boxShadow: {
        'scroll': '0 4px 6px -1px rgba(139, 115, 85, 0.3), 0 2px 4px -1px rgba(139, 115, 85, 0.2)',
        'glow': '0 0 15px rgba(255, 215, 0, 0.5)',
      },
    },
  },
  plugins: [],
}

export default config
