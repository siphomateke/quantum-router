module.exports = {
  root: true,

  env: {
    browser: true,
    node: true,
    es6: true,
    webextensions: true,
  },

  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-return-await': ['error'],
    'require-jsdoc': ['off'],
    indent: ['error', 2],
  },

  parserOptions: {
    parser: 'babel-eslint',
  },

  extends: [
    'plugin:vue/recommended',
    'google'
  ]
};
