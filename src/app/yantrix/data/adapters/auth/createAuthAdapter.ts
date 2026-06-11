import type { QueryClient } from '@tanstack/react-query';
import type { Services } from '~/shared/services/createServices';
import { AuthDataSource } from './AuthDataSource';
import { AuthDataDestination } from './AuthDataDestination';

/** Result of the auth adapter — both halves register directly with `CoreLoop`. */
export interface AuthAdapter {
	source: AuthDataSource;
	destination: AuthDataDestination;
	/** Underlying Data Source / Data Destination instances, exposed for tests. */
	internals: {
		dataSource: AuthDataSource;
		dataDestination: AuthDataDestination;
	};
}

/**
 * Factory that instantiates the auth request/response promise adapter and returns the raw
 * `IDataSource` / `IDataDestination` halves, registered directly with `CoreLoop`.
 *
 * Wiring (mirrors `IOPromiseAdapter.createPromiseDataAdapter`):
 */
export function createAuthAdapter(opts: { services: Services; queryClient: QueryClient }): AuthAdapter {
	const dataSource = new AuthDataSource();

	const dataDestination = new AuthDataDestination({
		services: opts.services,
		queryClient: opts.queryClient,
		onResolved: (result) => dataSource.push(result),
	});

	return {
		source: dataSource,
		destination: dataDestination,
		internals: { dataSource, dataDestination },
	};
}
