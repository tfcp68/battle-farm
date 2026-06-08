import { emitDomainEvent } from '~/app/yantrix/data/sources/UIBridgeDataSource';
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

