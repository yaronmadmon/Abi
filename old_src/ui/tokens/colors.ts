/**
 * Premium Color Tokens
 * Calm, minimal color palette
 */

export const colors = {
  // Base colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Neutral grays (soft, calm)
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E8E8E8',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  
  // Accent colors (muted, calm)
  accent: {
    blue: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
    },
    green: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D',
    },
    amber: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
    },
    rose: {
      50: '#FFF1F2',
      100: '#FFE4E6',
      200: '#FECDD3',
      300: '#FDA4AF',
      400: '#FB7185',
      500: '#F43F5E',
      600: '#E11D48',
      700: '#BE123C',
    },
  },
  
  // Semantic colors
  semantic: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#E11D48',
    info: '#3B82F6',
  },
  
  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#FAFAFA',
    tertiary: '#F5F5F5',
    elevated: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.4)',
  },
  
  // Text colors
  text: {
    primary: '#171717',
    secondary: '#525252',
    tertiary: '#737373',
    disabled: '#A3A3A3',
    inverse: '#FFFFFF',
  },
  
  // Border colors
  border: {
    light: '#E8E8E8',
    medium: '#D4D4D4',
    dark: '#A3A3A3',
  },
} as const;

export type ColorToken = typeof colors;
