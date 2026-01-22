module.exports = {
  root: true,
  extends: ['next/core-web-vitals'],
  rules: {
    // Warn on console.log (use logger instead)
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    // Warn on missing dependencies in useEffect
    'react-hooks/exhaustive-deps': 'warn',
    // Warn on unused variables
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
}
