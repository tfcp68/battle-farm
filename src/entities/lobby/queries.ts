import { useQuery } from '@tanstack/react-query';
import { useServices } from '~/app/providers/AppServicesProvider';

export const lobbyKeys = {
	all: ['lobbies'] as const,
	list: (status?: string | null) => [...lobbyKeys.all, 'list', status ?? 'any'] as const,
	byLobbyId: (lobbyId: string) => [...lobbyKeys.all, 'lobby', 'byId', lobbyId] as const,
	playersByLobbyId: (lobbyId: string) => [...lobbyKeys.all, 'players', 'byLobby', lobbyId] as const,
	requestsByLobbyId: (lobbyId: string) => [...lobbyKeys.all, 'requests', 'byLobby', lobbyId] as const,
};

export function useLobbiesList(params: { status: string }) {
	const { controllers } = useServices();
	return useQuery({
		queryKey: lobbyKeys.list(params.status ?? null),
		queryFn: () => controllers.lobbies.list(params),
	});
}

export function useLobbyById(lobbyId: string | null | undefined) {
	const { controllers } = useServices();
	return useQuery({
		queryKey: lobbyId ? lobbyKeys.byLobbyId(lobbyId) : ['lobbies', 'lobby', 'byId', 'nil'],
		queryFn: () => controllers.lobbies.getByLobbyId(lobbyId!),
		enabled: !!lobbyId,
	});
}

export function useLobbyPlayersByLobbyId(lobbyId: string | null | undefined) {
	const { controllers } = useServices();
	return useQuery({
		queryKey: lobbyId ? lobbyKeys.playersByLobbyId(lobbyId) : ['lobbies', 'players', 'byLobby', 'nil'],
		queryFn: () => controllers.lobbies.listPlayersByLobbyId(lobbyId!),
		enabled: !!lobbyId,
	});
}

export function useLobbyRequestsByLobbyId(lobbyId: string | null | undefined) {
	const { controllers } = useServices();
	return useQuery({
		queryKey: lobbyId ? lobbyKeys.requestsByLobbyId(lobbyId) : ['lobbies', 'requests', 'byLobby', 'nil'],
		queryFn: () => controllers.lobbies.listRequestsByLobbyId(lobbyId!),
		enabled: !!lobbyId,
	});
}

