import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServices } from '~/providers/AppServicesProvider';

// Единая схема ключей для всех хуков лобби
const lobbyKeys = {
	all: ['lobbies'] as const,
	list: (status?: string | null) => [...lobbyKeys.all, 'list', status ?? 'any'] as const,
	byLobbyId: (lobbyId: string) => [...lobbyKeys.all, 'lobby', 'byId', lobbyId] as const,
	byGameId: (gameId: string) => [...lobbyKeys.all, 'lobby', 'byGameId', gameId] as const,
	playersByLobbyId: (lobbyId: string) => [...lobbyKeys.all, 'players', 'byLobby', lobbyId] as const,
	requestsByLobbyId: (lobbyId: string) => [...lobbyKeys.all, 'requests', 'byLobby', lobbyId] as const,
};

export function useLobbiesList(params: { status: string; excludeHostPLayerId?: string }) {
	const { controllers } = useServices();
	const status = params?.status;
	return useQuery({
		queryKey: lobbyKeys.list(status ?? null),
		queryFn: () => controllers.lobbies.list(params),
	});
}

// Новый основной хук: получать лобби по lobbyId
export function useLobbyById(lobbyId: string | null | undefined) {
	const { controllers } = useServices();
	return useQuery({
		queryKey: lobbyId ? lobbyKeys.byLobbyId(lobbyId) : ['lobbies', 'lobby', 'byId', 'nil'],
		queryFn: () => controllers.lobbies.getByLobbyId(lobbyId!),
		enabled: !!lobbyId,
	});
}

// Переходный хук по gameId (старое поведение)
export function useLobby(gameId: string | null | undefined) {
	const { controllers } = useServices();
	return useQuery({
		queryKey: gameId ? lobbyKeys.byGameId(gameId) : ['lobbies', 'lobby', 'byGameId', 'nil'],
		queryFn: () => controllers.lobbies.get(gameId!),
		enabled: !!gameId,
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

// Переходный хук по gameId
export function useLobbyPlayers(gameId: string | null | undefined) {
	const { controllers } = useServices();
	return useQuery({
		queryKey: gameId ? ['lobbies', 'players', 'byGameId', gameId] : ['lobbies', 'players', 'byGameId', 'nil'],
		queryFn: () => controllers.lobbies.listPlayers(gameId!),
		enabled: !!gameId,
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

// Переходный хук по gameId
export function useLobbyRequests(gameId: string | null | undefined) {
	const { controllers } = useServices();
	return useQuery({
		queryKey: gameId ? ['lobbies', 'requests', 'byGameId', gameId] : ['lobbies', 'requests', 'byGameId', 'nil'],
		queryFn: () => controllers.lobbies.listRequests(gameId!),
		enabled: !!gameId,
	});
}

/* Mutations */

export function useCreateLobby() {
	const { controllers } = useServices();
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ hostPlayerId, gameId, maxPlayers }: { hostPlayerId: string; gameId?: string; maxPlayers?: number }) =>
			controllers.lobbies.create(hostPlayerId, { gameId, maxPlayers }),
		onSuccess: (lobby: { lobbyId: string; gameId: string } | any) => {
			qc.invalidateQueries({ queryKey: lobbyKeys.list(null) });
			if (lobby?.lobbyId) {
				qc.invalidateQueries({ queryKey: lobbyKeys.byLobbyId(lobby.lobbyId) });
				qc.invalidateQueries({ queryKey: lobbyKeys.playersByLobbyId(lobby.lobbyId) });
			}
			if (lobby?.gameId) {
				qc.invalidateQueries({ queryKey: lobbyKeys.byGameId(lobby.gameId) });
			}
		},
	});
}

// Новый основной мутатор: закрыть лобби по lobbyId
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

// Переходный мутатор по gameId
export function useCloseLobby() {
	const { controllers } = useServices();
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (gameId: string) => controllers.lobbies.close(gameId),
		onSuccess: (_ok, gameId) => {
			qc.invalidateQueries({ queryKey: lobbyKeys.list(null) });
			if (gameId) {
				qc.invalidateQueries({ queryKey: lobbyKeys.byGameId(gameId) });
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

export function useJoinLobby() {
	const { controllers } = useServices();
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ gameId, playerId, isHost = false }: { gameId: string; playerId: string; isHost?: boolean }) =>
			controllers.lobbies.addPlayer(gameId, playerId, isHost),
		onSuccess: (_lp, vars) => {
			qc.invalidateQueries({ queryKey: lobbyKeys.byGameId(vars.gameId) });
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

export function useLeaveLobby() {
	const { controllers } = useServices();
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ gameId, playerId }: { gameId: string; playerId: string }) =>
			controllers.lobbies.removePlayer(gameId, playerId),
		onSuccess: (_ok, vars) => {
			qc.invalidateQueries({ queryKey: lobbyKeys.byGameId(vars.gameId) });
			qc.invalidateQueries({ queryKey: lobbyKeys.list(null) });
		},
	});
}

// Toggle ready state for current player in a lobby by lobbyId
export function useSetPlayerReadyByLobbyId() {
	const { controllers } = useServices();
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ lobbyId, playerId, isReady }: { lobbyId: string; playerId: string; isReady: boolean }) =>
			controllers.lobbies.setPlayerReadyByLobbyId(lobbyId, playerId, isReady),
		onSuccess: (_result, vars) => {
			// refresh players list and lobby snapshot for that lobby
			qc.invalidateQueries({ queryKey: lobbyKeys.playersByLobbyId(vars.lobbyId) });
			qc.invalidateQueries({ queryKey: lobbyKeys.byLobbyId(vars.lobbyId) });
		},
	});
}

export function useRequestJoinLobbyById() {
	const { controllers } = useServices();
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ lobbyId, playerId, nickname }: { lobbyId: string; playerId: string; nickname?: string }) =>
			controllers.lobbies.requestJoinByLobbyId(lobbyId, playerId, nickname),
		onSuccess: (_req, vars) => {
			qc.invalidateQueries({ queryKey: lobbyKeys.requestsByLobbyId(vars.lobbyId) });
		},
	});
}

export function useRequestJoinLobby() {
	const { controllers } = useServices();
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ gameId, playerId, nickname }: { gameId: string; playerId: string; nickname?: string }) =>
			controllers.lobbies.requestJoin(gameId, playerId, nickname),
		onSuccess: (_req, vars) => {
			qc.invalidateQueries({ queryKey: lobbyKeys.byGameId(vars.gameId) });
		},
	});
}

export function useApproveJoin() {
	const { controllers } = useServices();
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (requestId: string) => controllers.lobbies.approveRequest(requestId),
		onSuccess: () => {
			// Без конкретного lobbyId/gameId — инвалидация глобальная
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