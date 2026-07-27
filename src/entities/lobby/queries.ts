import { useQuery } from '@tanstack/react-query';
import { useServices } from '~/app/providers/AppServicesProvider';
import { lobbyKeys } from './keys';

export { lobbyKeys };

/**
 * Reads come from in-memory room state, so there is nothing to poll:
 * `RoomQueryBridge` invalidates these keys whenever a snapshot lands.
 */
const roomQueryOptions = {
	staleTime: Infinity,
	refetchOnWindowFocus: false,
	refetchOnReconnect: false,
} as const;

export function useLobbyById(lobbyId: string | null | undefined) {
	const { controllers } = useServices();
	return useQuery({
		queryKey: lobbyKeys.byLobbyId(lobbyId ?? undefined),
		queryFn: () => controllers.lobbies.getByLobbyId(lobbyId!),
		enabled: !!lobbyId,
		...roomQueryOptions,
	});
}

export function useLobbyPlayersByLobbyId(lobbyId: string | null | undefined) {
	const { controllers } = useServices();
	return useQuery({
		queryKey: lobbyKeys.playersByLobbyId(lobbyId ?? undefined),
		queryFn: () => controllers.lobbies.listPlayersByLobbyId(lobbyId!),
		enabled: !!lobbyId,
		...roomQueryOptions,
	});
}

export function useLobbyRequestsByLobbyId(lobbyId: string | null | undefined) {
	const { controllers } = useServices();
	return useQuery({
		queryKey: lobbyKeys.requestsByLobbyId(lobbyId ?? undefined),
		queryFn: () => controllers.lobbies.listRequestsByLobbyId(lobbyId!),
		enabled: !!lobbyId,
		...roomQueryOptions,
	});
}
