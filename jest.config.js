/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  preset: 'ts-jest',
  resolver: 'ts-jest-resolver',
  testEnvironment: 'node',
  globalSetup: './tests/setup.ts',
  setupFilesAfterEnv: ['reflect-metadata'],
};
