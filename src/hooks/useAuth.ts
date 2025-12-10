import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServices } from '~/providers/AppServicesProvider';

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
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['auth', 'currentPlayer'] });
		},
	});

	const signIn = useMutation({
		mutationFn: ({ nickname, password }: { nickname: string; password: string }) =>
			controllers.auth.signIn(nickname, password),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['auth', 'currentPlayer'] });
		},
	});

	const signOut = useMutation({
		mutationFn: () => controllers.auth.signOut(),
		onSuccess: () => {
			qc.clear();
		},
	});

	return { register, signIn, signOut };
}