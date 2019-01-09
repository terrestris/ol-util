const path = require('path');
module.exports = {
  moduleFileExtensions: [
    'js'
  ],
  moduleDirectories: [
    'node_modules'
  ],
  transformIgnorePatterns: [
     'node_modules/(?!(ol)/)'
  ],
  setupFiles: [
    '<rootDir>/jest/__mocks__/shim.js',
    '<rootDir>/jest/setup.js'
  ],
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/TestUtil.js'
  ],
  coverageDirectory: '<rootDir>/coverage'
};
