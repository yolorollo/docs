import impressNextFlat from 'eslint-config-impress/next-flat';

export default [
  ...impressNextFlat,
  {
    ignores: ['node_modules/**', '.eslintrc.js', 'service-worker.js', '.next/**', 'out/**', 'build/**'],
  },
];
