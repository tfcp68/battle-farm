import { emitDomainEvent } from '~/app/yantrix/data/sources/UIBridgeDataSource';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';

export function useLobbyRequests() {
	return {
		approve(requestId: string, lobbyId: string) {
			emitDomainEvent(WindowDomainEvents.lobby_request_approved, { requestId, lobbyId });
		},
		reject(requestId: string, lobbyId: string) {
			emitDomainEvent(WindowDomainEvents.lobby_request_rejected, { requestId, lobbyId });
		},
	};
}
