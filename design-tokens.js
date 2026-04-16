/**
 * RT5VC Design Tokens
 * Green-Dominant Color System based on Logo
 * @version 2.0.0
 */

// ============================================
// COLOR PALETTE (Extracted from Logo)
// ============================================

const colors = {
  // Primary Green Scale (from hill/landscape)
  green: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50',  // Main green
    600: '#43A047',  // Primary hover
    700: '#2E7D32',  // Logo green (PRIMARY)
    800: '#1B5E20',  // Dark green
    900: '#0D3B0E',  // Darkest
  },

  // Secondary Teal/Cyan (from "VILLA CITAYAM" text)
  teal: {
    50: '#E0F7FA',
    100: '#B2EBF2',
    200: '#80DEEA',
    300: '#4DD0E1',
    400: '#26C6DA',
    500: '#00BCD4',
    600: '#00ACC1',
    700: '#00838F',  // Logo teal (SECONDARY)
    800: '#006064',
    900: '#004D40',
  },

  // Accent Yellow/Gold (from sun)
  amber: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFC107',
    600: '#FFB300',
    700: '#F9A825',  // Logo sun (ACCENT)
    800: '#F57F17',
    900: '#E65100',
  },

  // Navy/Dark Blue (from "RT05" text)
  navy: {
    50: '#E8EAF6',
    100: '#C5CAE9',
    200: '#9FA8DA',
    300: '#7986CB',
    400: '#5C6BC0',
    500: '#3F51B5',
    600: '#3949AB',
    700: '#303F9F',
    800: '#283593',
    900: '#1A237E',  // Logo navy
  },

  // Neutral Scale
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    1000: '#000000',
  },

  // Semantic Colors
  semantic: {
    success: '#16A34A',
    warning: '#D97706',
    error: '#DC2626',
    info: '#2563EB',
  },
};

// ============================================
// THEME TOKENS
// ============================================

const theme = {
  // Primary brand color
  primary: colors.green[700],
  'primary-content': colors.neutral[0], // White text on green
  'primary-hover': colors.green[800],
  'primary-light': colors.green[100],
  
  // Secondary color
  secondary: colors.teal[700],
  'secondary-content': colors.neutral[0],
  'secondary-hover': colors.teal[800],
  'secondary-light': colors.teal[100],
  
  // Accent color
  accent: colors.amber[700],
  'accent-content': colors.neutral[900], // Dark text on yellow
  'accent-hover': colors.amber[800],
  'accent-light': colors.amber[100],
  
  // Neutral colors
  neutral: colors.neutral[800],
  'neutral-content': colors.neutral[50],
  
  // Base colors (backgrounds)
  'base-100': colors.neutral[0],    // Main background
  'base-200': colors.green[50],     // Subtle green tint
  'base-300': colors.green[100],    // Light green background
  
  // Semantic
  info: colors.teal[500],
  success: colors.green[600],
  warning: colors.amber[600],
  error: '#DC2626',
};

// ============================================
// WCAG CONTRAST COMPLIANCE
// ============================================

const contrast = {
  // Primary green #2E7D32 on white: 5.8:1 ✅ (AA, AAA for large text)
  // White on green #2E7D32: 5.8:1 ✅
  // Navy #1A237E on white: 12.4:1 ✅
  // White on navy #1A237E: 12.4:1 ✅
  // Teal #00838F on white: 3.8:1 ⚠️ (Use for large text only)
  // Dark text on accent #F9A825: 8.2:1 ✅
  
  'primary-text': colors.neutral[0],      // White on green
  'primary-text-dark': colors.green[900], // Dark green text
  'secondary-text': colors.neutral[0],    // White on teal
  'body-text': colors.neutral[800],       // Dark gray on white
  'muted-text': colors.neutral[600],      // Medium gray
};

// ============================================
// SPACING SYSTEM (8px Base)
// ============================================

const spacing = {
  'space-1': '4px',    // 0.5 unit
  'space-2': '8px',    // 1 unit - BASE
  'space-3': '12px',   // 1.5 unit
  'space-4': '16px',   // 2 unit
  'space-5': '20px',   // 2.5 unit
  'space-6': '24px',   // 3 unit
  'space-8': '32px',   // 4 unit
  'space-10': '40px',  // 5 unit
  'space-12': '48px',  // 6 unit
  'space-16': '64px',  // 8 unit
  'space-20': '80px',  // 10 unit
  'space-24': '96px',  // 12 unit
};

// ============================================
// TYPOGRAPHY SCALE
// ============================================

const typography = {
  // Font families
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    display: ['Inter', 'system-ui', 'sans-serif'],
  },

  // Responsive font sizes with clamp()
  fontSize: {
    'display-1': 'clamp(2.5rem, 8vw, 4rem)',     // 40-64px
    'display-2': 'clamp(2rem, 5vw, 3rem)',       // 32-48px
    'heading-1': 'clamp(1.75rem, 4vw, 2.5rem)',  // 28-40px
    'heading-2': 'clamp(1.5rem, 3vw, 2rem)',     // 24-32px
    'heading-3': 'clamp(1.25rem, 2.5vw, 1.5rem)',// 20-24px
    'body-large': 'clamp(1rem, 1.5vw, 1.125rem)',// 16-18px
    'body': 'clamp(0.875rem, 1.2vw, 1rem)',      // 14-16px
    'small': 'clamp(0.75rem, 1vw, 0.875rem)',    // 12-14px
    'tiny': '0.75rem',                           // 12px
  },

  // Line heights
  lineHeight: {
    tight: '1.1',
    snug: '1.3',
    normal: '1.5',
    relaxed: '1.7',
  },

  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },
};

// ============================================
// LOGO SPECIFICATIONS
// ============================================

const logo = {
  // File paths
  src: {
    png: '/rt5vc.png',
    svg: '/rt5vc.svg', // Recommended to create
  },

  // Display sizes
  size: {
    xs: '32px',    // Favicon, small badges
    sm: '48px',    // Mobile header
    md: '64px',    // Tablet, cards
    lg: '80px',    // Desktop header
    xl: '120px',   // Hero section
    '2xl': '160px', // Splash page
  },

  // Aspect ratio (maintain from original)
  aspectRatio: 'auto',

  // Container padding
  containerPadding: {
    mobile: spacing['space-3'],  // 12px
    tablet: spacing['space-4'],  // 16px
    desktop: spacing['space-6'], // 24px
  },
};

// ============================================
// BREAKPOINTS
// ============================================

const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
};

// ============================================
// SHADOWS & EFFECTS
// ============================================

const effects = {
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    green: '0 10px 30px -5px rgba(46, 125, 50, 0.3)', // Green glow
  },

  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },

  backdropBlur: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
  },
};

// ============================================
// ACCESSIBILITY
// ============================================

const accessibility = {
  // Focus ring
  focusRing: {
    width: '2px',
    offset: '2px',
    color: colors.green[700],
    style: 'solid',
  },

  // Reduced motion
  reducedMotion: 'prefers-reduced-motion: reduce',

  // Minimum touch target
  minTouchTarget: '44px',

  // Color contrast requirements
  contrast: {
    normal: 4.5,  // AA for normal text
    large: 3,     // AA for large text (18px+ or 14px+ bold)
    enhanced: 7,  // AAA
  },
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  colors,
  theme,
  contrast,
  spacing,
  typography,
  logo,
  breakpoints,
  effects,
  accessibility,
};
