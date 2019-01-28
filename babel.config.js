module.exports = {
  'presets': [
    '@babel/env',
    '@babel/react'
  ],
  'plugins': [
    '@babel/plugin-proposal-function-bind',
    '@babel/plugin-transform-modules-commonjs',
    ['@babel/plugin-proposal-class-properties', { 'loose': false }],
  ]
};
