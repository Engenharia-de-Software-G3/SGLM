module.exports = {
  testEnvironment: 'node',
  rootDir: '../',
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  verbose: true,
  testTimeout: 15000,
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!(firebase-functions|firebase-admin)/)'
  ],
  collectCoverage: false, // Configuramos via CLI
  collectCoverageFrom: [
    '*.js',
    'scripts/**/*.js',
    '!.eslintrc.js',
    '!babel.config.js',
    '!firebaseConfig.js',
    '!node_modules/**',
    '!tests/**',
    '!coverage/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  }
};