import { useQuery } from '@tanstack/react-query';
import { useServices } from '~/app/providers/AppServicesProvider';

const gameKeys = {
	all: ['games'] as const,
	list: () => [...gameKeys.all, 'list'] as const,
	byId: (id: string) => [...gameKeys.all, 'byId', id] as const,
	byLobbyId: (lobbyId: string) => [...gameKeys.all, 'byLobbyId', lobbyId] as const,
};

export function useGameByLobbyId(lobbyId: string | null | undefined) {
	const { controllers } = useServices();
	return useQuery({
		queryKey: lobbyId ? gameKeys.byLobbyId(lobbyId) : ['games', 'byLobbyId', 'nil'],
		queryFn: () => controllers.games.getByLobbyId(lobbyId!),
		enabled: !!lobbyId,
	});
}

