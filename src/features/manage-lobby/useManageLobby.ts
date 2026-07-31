import { emitDomainEvent } from '~/app/yantrix/data/sources/UIBridgeDataSource';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';

/**
 * Starting a game is deliberately absent: this iteration covers the lobby only,
 * and there is no networked game loop to hand the room over to yet.
 */
export function useManageLobby() {
	return {
		closeLobby(lobbyId: string) {
			emitDomainEvent(WindowDomainEvents.lobby_closed, { lobbyId });
		},
		leaveLobby(lobbyId: string, playerId: string) {
			emitDomainEvent(WindowDomainEvents.player_exit, { lobbyId, playerId });
		},
	};
}
