import { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';

// @ts-ignore
import { compilerOptions } from './tsconfig.json';

const config: Config = {
	verbose: true,
	testEnvironment: 'node',
	preset: 'ts-jest',
	testRegex: '.*\\.test?\\.ts',
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
		prefix: '<rootDir>/',
	}),
};
export default config;
