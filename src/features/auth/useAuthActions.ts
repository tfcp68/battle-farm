import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useServices } from '~/app/providers/AppServicesProvider';
import { setCurrentPlayerId } from '~/entities/auth/queries';
import { useNavigate } from 'react-router-dom';

export function useAuthActions() {
	const { controllers } = useServices();
	const qc = useQueryClient();
	const navigate = useNavigate();

	const register = useMutation({
		mutationFn: ({ nickname, password }: { nickname: string; password: string }) =>
			controllers.auth.register(nickname, password),
		onSuccess: (data) => {
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
			navigate('/', { replace: true });
		},
	});

	return { register, signIn, signOut };
}

