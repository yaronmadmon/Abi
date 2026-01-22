module.exports = {
  root: true,
  extends: ['next/core-web-vitals'],
  overrides: [
    { files: ['lib/logger.ts'], rules: { 'no-console': 'off' } },
  ],
  rules: {
    // Warn on console.log (use logger instead)
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    // Warn on missing dependencies in useEffect
    'react-hooks/exhaustive-deps': 'warn',
    // Allow unescaped entities (apostrophes, quotes) in JSX
    'react/no-unescaped-entities': 'off',
    // Allow img tags (Next.js Image optimization can be added later)
    '@next/next/no-img-element': 'warn',
  },
}
