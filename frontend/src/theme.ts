export const theme = {
  colors: {
    background: {
      primary: '#18181A',
      secondary: '#1f1f21',
      tertiary: '#27272a',
    },
    
    text: {
      primary: '#FAFAFA',
      secondary: '#e0e0e0',
      tertiary: '#b0b0b0',
      muted: '#888',
      disabled: '#666',
    },
    
    border: {
      primary: '#2a2a2a',
      secondary: '#3a3a3a',
    },
    
    status: {
      covered: {
        primary: '#00ff88',
        background: '#1a2d23',
        light: '#00e67a',
      },
      partial: {
        primary: '#ffa726',
        background: '#2d2519',
      },
      notCovered: {
        primary: '#ff5252',
        background: '#2d1a1a',
        light: '#ff8a80',
      },
    },
  },
  
  typography: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: {
      xs: '12px',
      sm: '13px',
      base: '14px',
      lg: '18px',
      xl: '20px',
      xxl: '28px',
      xxxl: '32px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.5,
    },
    letterSpacing: {
      normal: '0',
      wide: '0.5px',
    },
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
    xxxl: '48px',
  },
  
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '50%',
  },
  
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.3)',
    md: '0 4px 8px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.6)',
  },
  
  transitions: {
    fast: '0.1s ease',
    normal: '0.2s ease',
    slow: '0.3s ease',
  },
  
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1200px',
  },
} as const;

export type Theme = typeof theme;
