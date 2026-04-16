/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";

export const content = [
  "./pages/**/*.{mjs,js,ts,jsx,tsx,mdx}",
  "./components/**/*.{mjs,js,ts,jsx,tsx,mdx}",
  "./app/**/*.{mjs,js,ts,jsx,tsx,mdx}",
];

export const theme = {
  extend: {
    fontFamily: {
      sans: ['Outfit', 'system-ui', '-apple-system', 'sans-serif'],
      display: ['Outfit', 'system-ui', 'sans-serif'],
    },
    
    // Custom color palette (Green Dominant)
    colors: {
      // Green Scale (Primary)
      green: {
        50: '#E8F5E9',
        100: '#C8E6C9',
        200: '#A5D6A7',
        300: '#81C784',
        400: '#66BB6A',
        500: '#4CAF50',
        600: '#43A047',
        700: '#2E7D32',  // Logo Primary
        800: '#1B5E20',
        900: '#0D3B0E',
      },
      
      // Teal Scale (Secondary)
      teal: {
        50: '#E0F7FA',
        100: '#B2EBF2',
        200: '#80DEEA',
        300: '#4DD0E1',
        400: '#26C6DA',
        500: '#00BCD4',
        600: '#00ACC1',
        700: '#00838F',  // Logo Secondary
        800: '#006064',
        900: '#004D40',
      },
      
      // Amber Scale (Accent)
      amber: {
        50: '#FFF8E1',
        100: '#FFECB3',
        200: '#FFE082',
        300: '#FFD54F',
        400: '#FFCA28',
        500: '#FFC107',
        600: '#FFB300',
        700: '#F9A825',  // Logo Sun
        800: '#F57F17',
        900: '#E65100',
      },
      
      // Navy Scale
      navy: {
        50: '#E8EAF6',
        100: '#C5CAE9',
        200: '#9FA8DA',
        500: '#3F51B5',
        700: '#303F9F',
        900: '#1A237E',  // Logo Text
      },
    },

    // Spacing system (8px base)
    spacing: {
      'space-1': '4px',
      'space-2': '8px',
      'space-3': '12px',
      'space-4': '16px',
      'space-5': '20px',
      'space-6': '24px',
      'space-8': '32px',
      'space-10': '40px',
      'space-12': '48px',
      'space-16': '64px',
      'space-20': '80px',
    },

    // Font sizes with clamp() for responsive
    fontSize: {
      'display-1': ['clamp(2.5rem, 8vw, 4rem)', { lineHeight: '1.1', fontWeight: '900' }],
      'display-2': ['clamp(2rem, 5vw, 3rem)', { lineHeight: '1.1', fontWeight: '800' }],
      'heading-1': ['clamp(1.75rem, 4vw, 2.5rem)', { lineHeight: '1.2', fontWeight: '700' }],
      'heading-2': ['clamp(1.5rem, 3vw, 2rem)', { lineHeight: '1.3', fontWeight: '700' }],
      'heading-3': ['clamp(1.25rem, 2.5vw, 1.5rem)', { lineHeight: '1.3', fontWeight: '600' }],
      'body-lg': ['clamp(1rem, 1.5vw, 1.125rem)', { lineHeight: '1.6' }],
      'body': ['clamp(0.875rem, 1.2vw, 1rem)', { lineHeight: '1.5' }],
      'small': ['clamp(0.75rem, 1vw, 0.875rem)', { lineHeight: '1.4' }],
    },

    // Border radius
    borderRadius: {
      'card': '16px',
      'card-lg': '24px',
    },

    // Shadows
    boxShadow: {
      'green': '0 10px 30px -5px rgba(46, 125, 50, 0.3)',
      'green-lg': '0 20px 40px -10px rgba(46, 125, 50, 0.4)',
      'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    },

    // Animations
    animation: {
      'fade-in': 'fadeIn 0.5s ease-out',
      'slide-up': 'slideUp 0.6s ease-out',
      'slide-down': 'slideDown 0.5s ease-out',
      'scale-in': 'scaleIn 0.3s ease-out',
      'blob': 'blob 7s infinite',
    },

    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      slideUp: {
        '0%': { transform: 'translateY(30px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      slideDown: {
        '0%': { transform: 'translateY(-20px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      scaleIn: {
        '0%': { transform: 'scale(0.95)', opacity: '0' },
        '100%': { transform: 'scale(1)', opacity: '1' },
      },
      blob: {
        '0%': { transform: 'translate(0px, 0px) scale(1)' },
        '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
        '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        '100%': { transform: 'translate(0px, 0px) scale(1)' },
      },
    },

    screens: {
      print: { raw: 'print' },
      screen: { raw: 'screen' },
    },
  },
};

export const plugins = [daisyui];

export const daisyui = {
  themes: [{
    rt5vc: {
      // Primary - Green (from logo)
      "primary": "#2E7D32",
      "primary-content": "#FFFFFF",
      
      // Secondary - Teal (from "VILLA CITAYAM")
      "secondary": "#00838F",
      "secondary-content": "#FFFFFF",
      
      // Accent - Amber/Yellow (from sun)
      "accent": "#F9A825",
      "accent-content": "#1A1A1A",
      
      // Neutral
      "neutral": "#1A237E",
      "neutral-content": "#FFFFFF",
      
      // Base colors
      "base-100": "#FFFFFF",
      "base-200": "#E8F5E9",  // Light green tint
      "base-300": "#C8E6C9",  // Slightly darker green
      
      // Semantic
      "info": "#00838F",
      "success": "#2E7D32",
      "warning": "#F9A825",
      "error": "#DC2626",
      
      // Additional states
      "--rounded-btn": "12px",
      "--rounded-box": "16px",
      "--rounded-card": "24px",
    }
  }],
  darkTheme: false,
};
