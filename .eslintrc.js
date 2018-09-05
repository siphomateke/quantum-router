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
    'no-return-await': ['error'],
    'require-jsdoc': ['off'],
    'indent': ['error', 2],
    'max-len': ['error', 120],
    'arrow-body-style': ['error', 'as-needed', {
      requireReturnForObjectLiteral: false,
    }],
    'arrow-parens': ['error', 'as-needed', {
      requireForBlockBody: true,
    }],
    'arrow-spacing': ['error', {before: true, after: true}],
  },

  parserOptions: {
    parser: 'babel-eslint',
  },

  extends: [
    'plugin:vue/recommended',
    'google',
  ],
};
