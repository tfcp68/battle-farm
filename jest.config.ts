import { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';

// @ts-ignore
import { compilerOptions } from './tsconfig.json';

const config: Config = {
	verbose: true,
	testEnvironment: 'node',
	preset: 'ts-jest',
	testRegex: '.*\\.test?\\.ts',
	// Pre-Yantrix suite importing `~/src/...` paths that no longer exist.
	testPathIgnorePatterns: ['/node_modules/', '/tests/reducers/'],
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
		prefix: '<rootDir>/',
	}),
};
export default config;
