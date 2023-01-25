import { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
const { compilerOptions } = require('./tsconfig.json');
module.exports = {
	verbose: true,
	testEnvironment: 'node',
	preset: 'ts-jest',
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
		prefix: '<rootDir>/',
	}),
} as Config;
