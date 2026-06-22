import { useQuery } from '@tanstack/react-query';
import { useServices } from '~/app/providers/AppServicesProvider';

export const CURRENT_PLAYER_ID_KEY = 'currentPlayerId';

export function setCurrentPlayerId(playerId: string | null) {
	if (typeof window === 'undefined') return;
	if (playerId) {
		window.localStorage.setItem(CURRENT_PLAYER_ID_KEY, playerId);
	} else {
		window.localStorage.removeItem(CURRENT_PLAYER_ID_KEY);
	}
}

export function useCurrentPlayer() {
	const { controllers } = useServices();
	return useQuery({
		queryKey: ['auth', 'currentPlayer'],
		queryFn: () => controllers.auth.currentPlayer(),
	});
}

