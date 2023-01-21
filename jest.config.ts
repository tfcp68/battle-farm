import type {Config} from 'jest';

const config: Config = {
  verbose: true,
  testEnvironment: 'node',
  preset: 'ts-jest',
  moduleNameMapper:{
    '^~(.*)$': '<rootDir>$1',
  }
};

export default config;

