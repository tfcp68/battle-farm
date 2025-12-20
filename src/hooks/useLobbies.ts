import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServices } from '~/providers/AppServicesProvider';

const lobbyKeys = {
	all: ['lobbies'] as const,
	list: (status?: string | null) => [...lobbyKeys.all, 'list', status ?? 'any'] as const,
	byLobbyId: (lobbyId: string) => [...lobbyKeys.all, 'lobby', 'byId', lobbyId] as const,
	playersByLobbyId: (lobbyId: string) => [...lobbyKeys.all, 'players', 'byLobby', lobbyId] as const,
	requestsByLobbyId: (lobbyId: string) => [...lobbyKeys.all, 'requests', 'byLobby', lobbyId] as const,
};

export function useLobbiesList(params: { status: string; excludeHostPlayerId: string }) {
	const { controllers } = useServices();
	const status = params?.status;
	return useQuery({
		queryKey: lobbyKeys.list(status ?? null),
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

export function useCreateLobby() {
	const { controllers } = useServices();
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ hostPlayerId, maxPlayers }: { hostPlayerId: string; maxPlayers?: number }) =>
			controllers.lobbies.create(hostPlayerId, { maxPlayers }),
		onSuccess: (lobby: { lobbyId: string }) => {
			qc.invalidateQueries({ queryKey: lobbyKeys.list(null) });
			if (lobby?.lobbyId) {
				qc.invalidateQueries({ queryKey: lobbyKeys.byLobbyId(lobby.lobbyId) });
				qc.invalidateQueries({ queryKey: lobbyKeys.playersByLobbyId(lobby.lobbyId) });
			}
		},
	});
}

export function useCloseLobbyById() {
	const { controllers } = useServices();
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (lobbyId: string) => controllers.lobbies.closeByLobbyId(lobbyId),
		onSuccess: (_result, lobbyId) => {
			qc.invalidateQueries({ queryKey: lobbyKeys.list(null) });
			if (lobbyId) {
				qc.invalidateQueries({ queryKey: lobbyKeys.byLobbyId(lobbyId) });
				qc.invalidateQueries({ queryKey: lobbyKeys.playersByLobbyId(lobbyId) });
				qc.invalidateQueries({ queryKey: lobbyKeys.requestsByLobbyId(lobbyId) });
			}
		},
	});
}

export function useJoinLobbyById() {
	const { controllers } = useServices();
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ lobbyId, playerId, isHost = false }: { lobbyId: string; playerId: string; isHost?: boolean }) =>
			controllers.lobbies.addPlayerByLobbyId(lobbyId, playerId, isHost),
		onSuccess: (_lp, vars) => {
			qc.invalidateQueries({ queryKey: lobbyKeys.playersByLobbyId(vars.lobbyId) });
			qc.invalidateQueries({ queryKey: lobbyKeys.byLobbyId(vars.lobbyId) });
			qc.invalidateQueries({ queryKey: lobbyKeys.list(null) });
		},
	});
}

export function useLeaveLobbyById() {
	const { controllers } = useServices();
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ lobbyId, playerId }: { lobbyId: string; playerId: string }) =>
			controllers.lobbies.removePlayerByLobbyId(lobbyId, playerId),
		onSuccess: (_result, vars) => {
			qc.invalidateQueries({ queryKey: lobbyKeys.playersByLobbyId(vars.lobbyId) });
			qc.invalidateQueries({ queryKey: lobbyKeys.byLobbyId(vars.lobbyId) });
			qc.invalidateQueries({ queryKey: lobbyKeys.list(null) });
		},
	});
}

export function useSetPlayerReadyByLobbyId() {
	const { controllers } = useServices();
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ lobbyId, playerId, isReady }: { lobbyId: string; playerId: string; isReady: boolean }) =>
			controllers.lobbies.setPlayerReadyByLobbyId(lobbyId, playerId, isReady),
		onSuccess: (_result, vars) => {
			qc.invalidateQueries({ queryKey: lobbyKeys.playersByLobbyId(vars.lobbyId) });
			qc.invalidateQueries({ queryKey: lobbyKeys.byLobbyId(vars.lobbyId) });
		},
	});
}

export function useRequestJoinLobbyById() {
	const { controllers } = useServices();
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ lobbyId, playerId }: { lobbyId: string; playerId: string; }) =>
			controllers.lobbies.requestJoinByLobbyId(lobbyId, playerId),
		onSuccess: (_req, vars) => {
			qc.invalidateQueries({ queryKey: lobbyKeys.requestsByLobbyId(vars.lobbyId) });
		},
	});
}

export function useApproveJoin() {
	const { controllers } = useServices();
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (requestId: string) => controllers.lobbies.approveRequest(requestId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: lobbyKeys.all });
		},
	});
}

export function useRejectJoin() {
	const { controllers } = useServices();
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (requestId: string) => controllers.lobbies.rejectRequest(requestId),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: lobbyKeys.all });
		},
	});
}