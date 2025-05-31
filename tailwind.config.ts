import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'shimmer-slide': 'shimmer-slide var(--speed) ease-in-out infinite alternate',
        'spin-around': 'spin-around calc(var(--speed) * 2) infinite linear',
      },
      keyframes: {
        'shimmer-slide': {
          to: {
            transform: 'translate(calc(100cqw - 100%), 0)',
          },
        },
        'spin-around': {
          '0%': {
            transform: 'translateZ(0) rotate(0)',
          },
          '15%, 35%': {
            transform: 'translateZ(0) rotate(90deg)',
          },
          '65%, 85%': {
            transform: 'translateZ(0) rotate(270deg)',
          },
          '100%': {
            transform: 'translateZ(0) rotate(360deg)',
          },
        },
      },
    },
    keyframes: {
      typing: {
        '0%, 100%': {
          transform: 'translateY(0)',
          opacity: '0.5',
        },
        '50%': {
          transform: 'translateY(-2px)',
          opacity: '1',
        },
      },
      'loading-dots': {
        '0%, 100%': {
          opacity: '0',
        },
        '50%': {
          opacity: '1',
        },
      },
      wave: {
        '0%, 100%': {
          transform: 'scaleY(1)',
        },
        '50%': {
          transform: 'scaleY(0.6)',
        },
      },
      blink: {
        '0%, 100%': {
          opacity: '1',
        },
        '50%': {
          opacity: '0',
        },
      },
    },
    'text-blink': {
      '0%, 100%': {
        color: 'var(--primary)',
      },
      '50%': {
        color: 'var(--muted-foreground)',
      },
    },
    'bounce-dots': {
      '0%, 100%': {
        transform: 'scale(0.8)',
        opacity: '0.5',
      },
      '50%': {
        transform: 'scale(1.2)',
        opacity: '1',
      },
    },
    'thin-pulse': {
      '0%, 100%': {
        transform: 'scale(0.95)',
        opacity: '0.8',
      },
      '50%': {
        transform: 'scale(1.05)',
        opacity: '0.4',
      },
    },
    'pulse-dot': {
      '0%, 100%': {
        transform: 'scale(1)',
        opacity: '0.8',
      },
      '50%': {
        transform: 'scale(1.5)',
        opacity: '1',
      },
    },
    'shimmer-text': {
      '0%': {
        backgroundPosition: '150% center',
      },
      '100%': {
        backgroundPosition: '-150% center',
      },
    },
    'wave-bars': {
      '0%, 100%': {
        transform: 'scaleY(1)',
        opacity: '0.5',
      },
      '50%': {
        transform: 'scaleY(0.6)',
        opacity: '1',
      },
    },
    shimmer: {
      '0%': {
        backgroundPosition: '200% 50%',
      },
      '100%': {
        backgroundPosition: '-200% 50%',
      },
    },
    'spinner-fade': {
      '0%': {
        opacity: '0',
      },
      '100%': {
        opacity: '1',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
