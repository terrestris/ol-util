module.exports = {
  'presets': [
    '@babel/env',
    '@babel/react',
    '@babel/preset-typescript'
  ],
  'plugins': [
    '@babel/plugin-proposal-function-bind',
    '@babel/plugin-transform-modules-commonjs',
    '@babel/plugin-transform-runtime',
    '@babel/plugin-transform-typescript',
    ['@babel/plugin-proposal-class-properties', { 'loose': false }],
  ]
};
