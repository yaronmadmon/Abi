/**
 * Premium Spacing Tokens
 * Soft, generous spacing scale
 */

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
  '4xl': '96px',
} as const;

export type SpacingToken = typeof spacing;

// Semantic spacing names
export const space = {
  none: '0',
  tight: spacing.xs,
  snug: spacing.sm,
  normal: spacing.md,
  relaxed: spacing.lg,
  loose: spacing.xl,
  extraLoose: spacing['2xl'],
  spacious: spacing['3xl'],
  generous: spacing['4xl'],
} as const;
