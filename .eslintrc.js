module.exports = {
  root: true,

  env: {
    browser: true,
    node: true,
    es6: true,
  },

  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-restricted-syntax': ['off'],
    'no-param-reassign': 'off',
    'no-shadow': 'off',
  },

  parserOptions: {
    parser: 'babel-eslint',
  },

  extends: [
    'plugin:vue/recommended',
    '@vue/airbnb',
  ],
};
