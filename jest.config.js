const path = require('path');
module.exports = {
  moduleFileExtensions: [
    'js'
  ],
  moduleDirectories: [
    'node_modules'
  ],
  transformIgnorePatterns: [
     'node_modules/(?!(ol|@terrestris)/)'
  ],
  setupFiles: [
    '<rootDir>/jest/__mocks__/shim.js',
    '<rootDir>/jest/setup.js'
  ],
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.js'
  ],
  coverageDirectory: '<rootDir>/coverage'
};
