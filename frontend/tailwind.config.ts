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
        // Dark Magitech theme
        void: '#0B0C15',
        obsidian: 'rgba(255,255,255,0.05)',
        luminescent: '#D4A843',
        silver: '#E8E6E3',
        // UI accents
        arcane: {
          gold: '#D4A843',
          purple: '#8B5CF6',
          glow: '#FFD700',
        },
        // Legacy scroll tokens (kept for gradual migration)
        scroll: {
          bg: '#F5E6D3',
          border: '#8B7355',
          text: '#2C1810',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'serif'],
        display: ['Cinzel', 'serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      backgroundImage: {
        'scroll-texture': "url('/textures/parchment.png')",
      },
      boxShadow: {
        'scroll': '0 4px 6px -1px rgba(139, 115, 85, 0.3), 0 2px 4px -1px rgba(139, 115, 85, 0.2)',
        'glow': '0 0 15px rgba(255, 215, 0, 0.5)',
        'glow-purple': '0 0 15px rgba(139, 92, 246, 0.4)',
        'glow-blue': '0 0 15px rgba(14, 104, 171, 0.4)',
      },
    },
  },
  plugins: [],
}

export default config
