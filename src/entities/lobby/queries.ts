import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServices } from '~/app/providers/AppServicesProvider';
import supabase from '~/shared/api/connect';

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

/**
 * Live-updates the lobby's join-request and player caches via Supabase Realtime.
 * Mount this where the host views the lobby so incoming requests appear instantly,
 * without polling or a manual refresh.
 *
 * Prerequisite: Realtime must be enabled for the `lobby_requests` table in Supabase
 * (Database → Replication / the `supabase_realtime` publication).
 */
export function useLobbyRequestsRealtime(lobbyId: string | null | undefined) {
	const queryClient = useQueryClient();

	useEffect(() => {
		if (!lobbyId) return;

		const channel = supabase
			.channel(`lobby_requests:${lobbyId}`)
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: 'lobby_requests', filter: `lobby_id=eq.${lobbyId}` },
				() => {
					queryClient.invalidateQueries({ queryKey: lobbyKeys.requestsByLobbyId(lobbyId) });
					queryClient.invalidateQueries({ queryKey: lobbyKeys.playersByLobbyId(lobbyId) });
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [lobbyId, queryClient]);
}

