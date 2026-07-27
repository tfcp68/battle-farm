/**
 * Query keys live apart from the hooks so non-React code (data destinations,
 * the room→cache bridge) can invalidate without importing the React tree.
 */
/** Stands in for the lobby id when there is no room — the query stays disabled. */
export const NO_LOBBY = 'nil';

export const lobbyKeys = {
	all: ['lobbies'] as const,
	byLobbyId: (lobbyId: string = NO_LOBBY) => [...lobbyKeys.all, 'lobby', 'byId', lobbyId] as const,
	playersByLobbyId: (lobbyId: string = NO_LOBBY) =>
		[...lobbyKeys.all, 'players', 'byLobby', lobbyId] as const,
	requestsByLobbyId: (lobbyId: string = NO_LOBBY) =>
		[...lobbyKeys.all, 'requests', 'byLobby', lobbyId] as const,
	/** Prefix shared by every per-lobby player list, for cache-wide lookups. */
	playersPrefix: () => [...lobbyKeys.all, 'players', 'byLobby'] as const,
};
