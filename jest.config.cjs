/** @type {import('jest').Config} */

module.exports = {
    preset: 'ts-jest',
    transform: {
      '^.+\\.(ts|tsx)?$': 'ts-jest',
      '^.+\\.(js|jsx)$': 'babel-jest',
    },
    testMatch: ['**/tests/**/test*.js'],
    "testTimeout": 1000000
  };