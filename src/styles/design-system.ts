/**
 * ResearchAI Premium Design System
 * 
 * A sophisticated, cinematic design language for an advanced research workspace.
 * Emphasizes depth, hierarchy, premium typography, and refined interactions.
 */

export const designSystem = {
  // ============================================================================
  // COLOR PALETTE
  // ============================================================================
  colors: {
    // Primary Background - Deep cinematic foundation
    background: {
      primary: '#040609',    // Deep black base
      secondary: '#0a0e15',  // Slightly lighter
      tertiary: '#121820',   // Accent areas
      surface: '#0f131a',    // Cards/surfaces
      hover: '#15192a',      // Interactive hover
      overlay: 'rgba(4, 6, 9, 0.8)',
    },

    // Text - Premium typography
    text: {
      primary: '#f0f2f7',    // Main text
      secondary: '#b4b9c7',  // Supporting text
      muted: '#7d8599',      // Tertiary/disabled
      inverted: '#040609',   // For light backgrounds
    },

    // Accent - Controlled, sophisticated lighting
    accent: {
      primary: '#6366f1',    // Indigo - primary accent
      secondary: '#8b5cf6',  // Violet - secondary
      tertiary: '#06b6d4',   // Cyan - highlights
      warm: '#f59e0b',       // Amber - warnings/alerts
      danger: '#ef4444',     // Red - errors
      success: '#10b981',    // Emerald - success
    },

    // Glass & Glow effects
    glass: {
      light: 'rgba(255, 255, 255, 0.05)',
      lighter: 'rgba(255, 255, 255, 0.08)',
      medium: 'rgba(255, 255, 255, 0.12)',
    },

    glow: {
      indigo: 'rgba(99, 102, 241, 0.2)',
      violet: 'rgba(139, 92, 246, 0.15)',
      cyan: 'rgba(6, 182, 212, 0.15)',
    },

    // Borders
    border: {
      subtle: 'rgba(255, 255, 255, 0.05)',
      default: 'rgba(255, 255, 255, 0.1)',
      strong: 'rgba(255, 255, 255, 0.15)',
      accent: 'rgba(99, 102, 241, 0.3)',
    },
  },

  // ============================================================================
  // TYPOGRAPHY
  // ============================================================================
  typography: {
    fontFamily: {
      sans: "'Inter', system-ui, -apple-system, sans-serif",
      heading: "'Outfit', 'Inter', sans-serif",
      mono: "'JetBrains Mono', monospace",
    },

    fontSize: {
      xs: { size: '0.75rem', lineHeight: '1rem', weight: 500 },
      sm: { size: '0.875rem', lineHeight: '1.25rem', weight: 400 },
      base: { size: '1rem', lineHeight: '1.5rem', weight: 400 },
      lg: { size: '1.125rem', lineHeight: '1.75rem', weight: 500 },
      xl: { size: '1.25rem', lineHeight: '1.75rem', weight: 600 },
      '2xl': { size: '1.5rem', lineHeight: '2rem', weight: 600 },
      '3xl': { size: '1.875rem', lineHeight: '2.25rem', weight: 700 },
      '4xl': { size: '2.25rem', lineHeight: '2.5rem', weight: 700 },
      '5xl': { size: '3rem', lineHeight: '3.5rem', weight: 700 },
    },

    // Predefined text styles
    styles: {
      // Headings
      h1: 'text-5xl font-bold tracking-tight font-heading',
      h2: 'text-4xl font-bold tracking-tight font-heading',
      h3: 'text-3xl font-semibold font-heading',
      h4: 'text-2xl font-semibold font-heading',
      h5: 'text-xl font-semibold font-heading',
      h6: 'text-lg font-semibold font-heading',

      // Body
      body: 'text-base font-normal',
      bodySmall: 'text-sm font-normal',
      bodyLarge: 'text-lg font-normal',

      // Labels
      label: 'text-sm font-medium uppercase tracking-wider',
      caption: 'text-xs font-medium uppercase tracking-wider',
    },
  },

  // ============================================================================
  // SPACING & LAYOUT
  // ============================================================================
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
    '3xl': '3rem',
    '4xl': '4rem',
    '5xl': '5rem',
    '6xl': '6rem',
  },

  // ============================================================================
  // SHADOWS & DEPTH
  // ============================================================================
  shadows: {
    // Subtle depth layers
    xs: '0 1px 2px rgba(0, 0, 0, 0.3)',
    sm: '0 2px 8px rgba(0, 0, 0, 0.4)',
    md: '0 4px 16px rgba(0, 0, 0, 0.5)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.6)',
    xl: '0 16px 48px rgba(0, 0, 0, 0.7)',
    '2xl': '0 20px 64px rgba(0, 0, 0, 0.8)',

    // Glowing shadows
    glowSm: '0 0 20px rgba(99, 102, 241, 0.15)',
    glowMd: '0 0 40px rgba(99, 102, 241, 0.2)',
    glowLg: '0 0 60px rgba(99, 102, 241, 0.25)',

    // Inset shadows for depth
    insetSm: 'inset 0 1px 2px rgba(255, 255, 255, 0.05)',
    insetMd: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)',
  },

  // ============================================================================
  // BORDER RADIUS
  // ============================================================================
  borderRadius: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    full: '9999px',
  },

  // ============================================================================
  // TRANSITIONS & ANIMATIONS
  // ============================================================================
  transitions: {
    // Duration
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',

    // Easing
    easing: {
      ease: 'ease',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      smooth: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },

    // Standard transitions
    standard: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    standardFast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    standardSlow: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // ============================================================================
  // MOTION & ANIMATION VALUES
  // ============================================================================
  motion: {
    // Framer Motion animation presets
    enterFromLeft: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
    },

    enterFromRight: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
    },

    enterFromTop: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },

    enterFromBottom: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
    },

    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },

    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },

    // Transition durations
    duration: {
      fast: 0.15,
      base: 0.2,
      slow: 0.3,
      slower: 0.5,
    },
  },

  // ============================================================================
  // COMPONENT SCALES
  // ============================================================================
  components: {
    // Button sizes
    button: {
      xs: { padding: '0.375rem 0.75rem', fontSize: '0.75rem' },
      sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
      md: { padding: '0.625rem 1.25rem', fontSize: '1rem' },
      lg: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
      xl: { padding: '1rem 2rem', fontSize: '1.125rem' },
    },

    // Card styles
    card: {
      padding: '1.5rem',
      borderRadius: '1rem',
      border: 'rgba(255, 255, 255, 0.1)',
      background: 'rgba(12, 18, 32, 0.6)',
    },

    // Input styles
    input: {
      padding: '0.625rem 1rem',
      borderRadius: '0.75rem',
      border: 'rgba(255, 255, 255, 0.1)',
      fontSize: '1rem',
    },
  },

  // ============================================================================
  // GLASS & FROSTED GLASS EFFECTS
  // ============================================================================
  glass: {
    light: {
      background: 'rgba(12, 18, 32, 0.4)',
      backdropFilter: 'blur(10px)',
      border: 'rgba(255, 255, 255, 0.1)',
    },

    medium: {
      background: 'rgba(12, 18, 32, 0.6)',
      backdropFilter: 'blur(16px)',
      border: 'rgba(255, 255, 255, 0.15)',
    },

    strong: {
      background: 'rgba(12, 18, 32, 0.8)',
      backdropFilter: 'blur(20px)',
      border: 'rgba(255, 255, 255, 0.2)',
    },
  },
} as const;

export type DesignSystem = typeof designSystem;
