import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServices } from '~/providers/AppServicesProvider';

const gameKeys = {
	all: ['games'] as const,
	list: () => [...gameKeys.all, 'list'] as const,
	byId: (id: string) => [...gameKeys.all, 'byId', id] as const,
	byLobbyId: (lobbyId: string) => [...gameKeys.all, 'byLobbyId', lobbyId] as const,
};

export type GameDto = {
	id: string;
	lobbyId: string;
	createdAt: string;
	updatedAt: string | null;
};

export function useGamesList() {
	const { controllers } = useServices();
	return useQuery({
		queryKey: gameKeys.list(),
		queryFn: () => controllers.games.list(),
	});
}

export function useGameById(gameId: string | null | undefined) {
	const { controllers } = useServices();
	return useQuery({
		queryKey: gameId ? gameKeys.byId(gameId) : ['games', 'byId', 'nil'],
		queryFn: () => controllers.games.getById(gameId!),
		enabled: !!gameId,
	});
}

export function useGameByLobbyId(lobbyId: string | null | undefined) {
	const { controllers } = useServices();
	return useQuery({
		queryKey: lobbyId ? gameKeys.byLobbyId(lobbyId) : ['games', 'byLobbyId', 'nil'],
		queryFn: () => controllers.games.getByLobbyId(lobbyId!),
		enabled: !!lobbyId,
	});
}

export function useCreateGame() {
	const { controllers } = useServices();
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ lobbyId }: { lobbyId: string }) => controllers.games.create({ lobbyId }),
		onSuccess: (g: any) => {
			qc.invalidateQueries({ queryKey: gameKeys.list() });
			if (g?.id) qc.invalidateQueries({ queryKey: gameKeys.byId(g.id) });
			if (g?.lobbyId) qc.invalidateQueries({ queryKey: gameKeys.byLobbyId(g.lobbyId) });
		},
	});
}

export function useUpdateGame() {
	const { controllers } = useServices();
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, patch }: { id: string; patch: Partial<{ lobbyId: string; updatedAt: string | null }> }) =>
			controllers.games.update(id, patch),
		onSuccess: (g: any) => {
			qc.invalidateQueries({ queryKey: gameKeys.list() });
			if (g?.id) qc.invalidateQueries({ queryKey: gameKeys.byId(g.id) });
			if (g?.lobbyId) qc.invalidateQueries({ queryKey: gameKeys.byLobbyId(g.lobbyId) });
		},
	});
}

export function useDeleteGame() {
	const { controllers } = useServices();
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => controllers.games.delete(id),
		onSuccess: (_ok, id) => {
			qc.invalidateQueries({ queryKey: gameKeys.list() });
			if (id) qc.removeQueries({ queryKey: gameKeys.byId(id) });
			
		},
	});
}

