import { useQueryClient } from '@tanstack/react-query';
import { useServices } from '~/app/providers/AppServicesProvider';
import { emitDomainEvent } from '~/app/yantrix/data/sources/UIBridgeDataSource';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { setCurrentProfile } from '~/entities/profile/currentProfile';
import { profileKeys } from '~/entities/profile/queries';

/**
 * Naming yourself is a local storage write — no network, no failure worth a
 * pending state — so it runs inline and only the outcome goes on the bus. Room
 * commands go through a destination precisely because they can hang and fail.
 */
export function useProfileActions() {
	const { controllers } = useServices();
	const queryClient = useQueryClient();

	return {
		async setNickname(nickname: string): Promise<void> {
			const profile = await controllers.profile.setNickname(nickname);
			setCurrentProfile(profile);
			await queryClient.invalidateQueries({ queryKey: profileKeys.current() });
			emitDomainEvent(WindowDomainEvents.profile_created, { playerId: profile.playerId });
		},

		/** Sends the player back to the nickname screen; clearing happens in a destination. */
		changeNickname(): void {
			emitDomainEvent(WindowDomainEvents.profile_cleared, null);
		},
	};
}
