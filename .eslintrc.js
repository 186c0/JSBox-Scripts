module.exports = {
  root: true,
  parser: "vue-eslint-parser",
  "parserOptions": {
    "ecmaVersion": 8,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  env: {
    node: true,
    browser: true,
  },
  extends: ['standard', 'plugin:vue/essential'],
  plugins: ['html', "standard", "promise"],
  rules: {
    "no-undef": ["off"],
    "class-methods-use-this": ["off"],
    "space-before-function-paren": [2, {
      "anonymous": "always",
      "named": "never"
    }],
    "no-new": ['off'],
    indent: ['off'],
    'arrow-parens': 0,
    'generator-star-spacing': 0,
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'import/no-extraneous-dependencies': ['off'],
    'function-paren-newline': ['off'],
    'class-methods-use-this': [
      'error',
      {
        exceptMethods: [
          'render',
          'beforeCreate',
          'created',
          'beforeMount',
          'mounted',
          'beforeUpdate',
          'updated',
          'activated',
          'deactivated',
          'beforeDestroy',
          'destroyed',
          'errorCaptured',
        ],
      },
    ],
    'max-len': [
      'error',
      {
        code: 160,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreComments: true,
        ignoreTrailingComments: true,
        ignoreTemplateLiterals: true,
      },
    ],
  },
};