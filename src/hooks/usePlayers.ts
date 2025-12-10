import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServices } from '~/providers/AppServicesProvider';

const keys = {
	all: ['players'] as const,
	list: () => [...keys.all, 'list'] as const,
	byId: (id: string) => [...keys.all, 'byId', id] as const,
};

export function usePlayersList() {
	const { controllers } = useServices();
	return useQuery({
		queryKey: keys.list(),
		queryFn: () => controllers.players.list(),
	});
}

export function usePlayer(playerId: string | null | undefined) {
	const { controllers } = useServices();
	return useQuery({
		queryKey: playerId ? keys.byId(playerId) : ['players', 'byId', 'nil'],
		queryFn: () => controllers.players.getById(playerId!),
		enabled: !!playerId,
	});
}

export function useRegisterPlayer() {
	const { controllers } = useServices();
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (nickname: string) => controllers.players.register(nickname),
		onSuccess: (p: any) => {
			qc.invalidateQueries({ queryKey: keys.list() });
			if (p?.playerId) qc.invalidateQueries({ queryKey: keys.byId(p.playerId) });
		},
	});
}

export function useUpdateNickname() {
	const { controllers } = useServices();
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ playerId, nickname }: { playerId: string; nickname: string }) =>
			controllers.players.updateNickname(playerId, nickname),
		onSuccess: (p: any) => {
			qc.invalidateQueries({ queryKey: keys.list() });
			if (p?.playerId) qc.invalidateQueries({ queryKey: keys.byId(p.playerId) });
		},
	});
}

export function useDeletePlayer() {
	const { controllers } = useServices();
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (playerId: string) => controllers.players.delete(playerId),
		onSuccess: (_ok, playerId) => {
			qc.invalidateQueries({ queryKey: keys.list() });
			if (playerId) qc.removeQueries({ queryKey: keys.byId(playerId) });
		},
	});
}