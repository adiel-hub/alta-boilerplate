import baseConfig from './base.js';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  ...baseConfig,
  {
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
];
