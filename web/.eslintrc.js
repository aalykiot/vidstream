module.exports = {
  env: {
    node: true,
    browser: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: [
    'eslint:recommended',
    'airbnb/hooks',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:import/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['react', 'prettier'],
  settings: {
    react: {
      version: '18.x',
    },
  },
  rules: {
    'react/prop-types': 'off',
    'react-hooks/exhaustive-deps': 'off',
  },
};
