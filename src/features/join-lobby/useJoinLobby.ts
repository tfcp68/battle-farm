import { emitDomainEvent } from '~/app/yantrix/sources/uiBridgeSource';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';

export function useJoinLobby() {
	return {
		requestJoin(lobbyId: string, playerId: string) {
			emitDomainEvent(WindowDomainEvents.join_game_request, {
				src: 'ui',
				lobbyId,
				playerId,
				gameId: null,
			});
		},
		cancelJoin() {
			emitDomainEvent(WindowDomainEvents.cancel_game_request, null);
		},
	};
}

