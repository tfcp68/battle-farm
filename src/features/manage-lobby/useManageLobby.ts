import { emitDomainEvent } from '~/app/yantrix/sources/uiBridgeSource';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';

export function useManageLobby() {
	return {
		closeLobby(lobbyId: string) {
			emitDomainEvent(WindowDomainEvents.lobby_closed, { lobbyId });
		},
		leaveLobby(lobbyId: string, playerId: string) {
			emitDomainEvent(WindowDomainEvents.player_exit, { lobbyId, playerId });
		},
		startGame(lobbyId: string) {
			emitDomainEvent(WindowDomainEvents.game_start, { lobbyId });
		},
	};
}

