import { emitDomainEvent } from '~/app/yantrix/data/sources/UIBridgeDataSource';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';

export function useAuthActions() {
	return {
		signIn(nickname: string, password: string) {
			emitDomainEvent(WindowDomainEvents.auth_requested, {
				mode: 'signIn',
				nickname,
				password,
			});
		},
		register(nickname: string, password: string) {
			emitDomainEvent(WindowDomainEvents.auth_requested, {
				mode: 'signUp',
				nickname,
				password,
			});
		},
		signOut() {
			emitDomainEvent(WindowDomainEvents.auth_signed_out, null);
		},
	};
}
