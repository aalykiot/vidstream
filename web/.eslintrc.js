module.exports = {
  env: {
    node: true,
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    sourceType: 'module',
    requireConfigFile: false,
    babelOptions: {
      presets: ['@babel/preset-react'],
    },
  },
  extends: [
    'eslint:recommended',
    'plugin:solid/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['solid', 'prettier'],
  rules: {
    // override/add rules settings here, such as:
    // 'vue/no-unused-vars': 'error'
  },
};
