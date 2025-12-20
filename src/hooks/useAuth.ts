import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServices } from '~/providers/AppServicesProvider';

export const CURRENT_PLAYER_ID_KEY = 'currentPlayerId';

function setCurrentPlayerId(playerId: string | null) {
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

export function useAuthActions() {
	const { controllers } = useServices();
	const qc = useQueryClient();

	const register = useMutation({
		mutationFn: ({ nickname, password }: { nickname: string; password: string }) =>
			controllers.auth.register(nickname, password),
		onSuccess: (data) => {
			// data is { user, player }
			if (data?.player?.playerId) {
				setCurrentPlayerId(data.player.playerId);
			}
			qc.invalidateQueries({ queryKey: ['auth', 'currentPlayer'] });
		},
	});

	const signIn = useMutation({
		mutationFn: ({ nickname, password }: { nickname: string; password: string }) =>
			controllers.auth.signIn(nickname, password),
		onSuccess: (data) => {
			if (data?.player?.playerId) {
				setCurrentPlayerId(data.player.playerId);
			}
			qc.invalidateQueries({ queryKey: ['auth', 'currentPlayer'] });
		},
	});

	const signOut = useMutation({
		mutationFn: () => controllers.auth.signOut(),
		onSuccess: () => {
			setCurrentPlayerId(null);
			qc.clear();
		},
	});

	return { register, signIn, signOut };
}