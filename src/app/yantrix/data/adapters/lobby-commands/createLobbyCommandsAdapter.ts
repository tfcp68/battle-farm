import type { QueryClient } from '@tanstack/react-query';
import type { Services } from '~/shared/services/createServices';
import { LobbyCommandsDataSource } from './LobbyCommandsDataSource';
import { LobbyCommandsDataDestination } from './LobbyCommandsDataDestination';

/** Result of the lobby-commands adapter — both halves register directly with `CoreLoop`. */
export interface LobbyCommandsAdapter {
	source: LobbyCommandsDataSource;
	destination: LobbyCommandsDataDestination;
	/** Underlying Data Source / Data Destination instances, exposed for tests. */
	internals: {
		dataSource: LobbyCommandsDataSource;
		dataDestination: LobbyCommandsDataDestination;
	};
}

/**
 * Factory wiring the lobby-commands promise adapter. Identical shape to {@link createAuthAdapter} —
 * pairs a Data Source with a Data Destination via `onResolved`, and returns the raw
 * `IDataSource` / `IDataDestination` halves that register directly with `CoreLoop`.
 *
 * Inbound events:
 *   - `lobby_created` (UI emit, lobbyId: null) — creates a new lobby + game
 *   - `re_enter_lobby` — fetches the existing game by lobbyId
 *   - `join_game_request` — writes a join request row
 *
 * Outbound (follow-up) events:
 *   - `lobby_created` (enriched, real ids) — for the first two
 *   - `request_rejected` — when `join_game_request` hits `LobbyNotOpenError`
 *   - (none) — successful `join_game_request` paths
 */
export function createLobbyCommandsAdapter(opts: {
	services: Services;
	queryClient: QueryClient;
}): LobbyCommandsAdapter {
	const dataSource = new LobbyCommandsDataSource();

	const dataDestination = new LobbyCommandsDataDestination({
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
