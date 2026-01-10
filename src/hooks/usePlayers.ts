import { useQuery } from '@tanstack/react-query';
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