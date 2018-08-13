module.exports = {
  "extends": "airbnb-base",
  "plugins": [
    "import"
  ],
  // add your custom rules here
  'rules': {
    'comma-dangle': 0,
    'arrow-parens': 0,
    'no-console': 0,
    // don't require .vue extension when importing
    'import/extensions': ['error', 'always', {
      'js': 'never',
      'vue': 'never'
    }],
    // allow optionalDependencies
    'import/no-extraneous-dependencies': ['error', {
      'optionalDependencies': ['test/unit/index.js']
    }],
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'linebreak-style': ["error", "windows"],
    'max-len': 0,
    'no-underscore-dangle': 0,
    // allow function hoisting
    "no-use-before-define": ["error", { "functions": false }],
    "prefer-destructuring": 0,
  }
};