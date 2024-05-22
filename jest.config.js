module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: [
    'ts',
    'js',
    'json'
  ],
  transform: {
    '^.+\\.js$': '<rootDir>/node_modules/babel-jest',
    '^.+\\.ts$': '<rootDir>/node_modules/babel-jest'
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!(ol|@babel|jest-runtime|@terrestris|color-space|color-rgba|color-name|' +
    'color-parse|shpjs|filter-obj|split-on-first|decode-uri-component|query-string))'
  ],
  testRegex: '/src/.*\\.spec.(ts|js)$',
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/spec/**/*.{ts,js}'
  ],
  roots: [
    './src'
  ]
};
