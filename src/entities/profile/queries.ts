import { useQuery } from '@tanstack/react-query';
import { useServices } from '~/app/providers/AppServicesProvider';

export const profileKeys = {
	all: ['profile'] as const,
	current: () => [...profileKeys.all, 'current'] as const,
};

export function useCurrentProfile() {
	const { controllers } = useServices();
	return useQuery({
		queryKey: profileKeys.current(),
		queryFn: () => controllers.profile.current(),
	});
}
