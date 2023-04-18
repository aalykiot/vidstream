module.exports = {
  env: {
    node: true,
    browser: true,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: [
    'airbnb',
    'airbnb-typescript',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
  ],
  plugins: ['react', 'prettier', '@typescript-eslint'],
  settings: {
    react: {
      version: '18.x',
    },
  },
  rules: {
    'no-param-reassign': ['error', { props: false }],
  },
};
