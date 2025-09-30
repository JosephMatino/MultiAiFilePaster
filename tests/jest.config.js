/**
 * ================================================================================
 * MULTI-AI FILE PASTER CHROME EXTENSION | PRODUCTION RELEASE v1.1.0
 * CHROME EXTENSION SOFTWARE - HOSTWEK CUSTOM LICENSE
 * ================================================================================
 *
 * MODULE: tests/jest.config.js
 * FUNCTION: Jest testing framework configuration
 * ARCHITECTURE: Unit and integration test configuration
 * 
 * COPYRIGHT © 2025 HOSTWEK LTD. ALL RIGHTS RESERVED.
 * DEVELOPED BY JOSEPH MATINO UNDER WEKTURBO DESIGNS - HOSTWEK LTD
 * ================================================================================
 */

module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Setup files - Mock Chrome APIs
  setupFilesAfterEnv: ['<rootDir>/setup.js'],
  
  // Test file patterns
  testMatch: [
    '<rootDir>/unit/**/*.test.js',
    '<rootDir>/integration/**/*.test.js'
  ],
  
  // Root directory for tests
  rootDir: './',
  
  // Coverage configuration
  collectCoverageFrom: [
    '../src/**/*.js',
    '!../src/content/index.js',
    '!../src/background/index.js',
    '!../src/popup/index.js'
  ],
  
  // Coverage thresholds (production-ready standards)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Module paths
  moduleDirectories: ['node_modules', '../src'],
  
  // Transform configuration (if needed)
  transform: {},
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks between tests
  restoreMocks: true
};
