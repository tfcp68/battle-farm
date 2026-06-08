import { emitDomainEvent } from '~/app/yantrix/data/sources/UIBridgeDataSource';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';

export function useCreateLobby() {
	return {
		createLobby(playerId: string) {
			emitDomainEvent(WindowDomainEvents.lobby_created, {
				playerId,
				isHost: 1,
				gameId: null,
				lobbyId: null,
			});
		},
	};
}

