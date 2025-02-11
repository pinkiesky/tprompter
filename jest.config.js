/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+.tsx?$': ['ts-jest', {}],
  },
  globalSetup: './tests/setup.ts',
  setupFilesAfterEnv: ['reflect-metadata'],
};
