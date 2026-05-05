import { emitDomainEvent } from '~/app/yantrix/sources/uiBridgeSource';
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

