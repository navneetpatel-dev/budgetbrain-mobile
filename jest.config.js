const expoPreset = require('jest-expo/jest-preset');

module.exports = {
  preset: 'jest-expo',
  // jest-expo's list, plus Redux Toolkit and its ESM-only dependencies so slice code is testable.
  transformIgnorePatterns: [
    expoPreset.transformIgnorePatterns[0].replace('|standard-navigation))', '|standard-navigation|@reduxjs/toolkit|immer|redux|reselect))'),
    ...expoPreset.transformIgnorePatterns.slice(1),
  ],
};
