import { emitDomainEvent } from '~/app/yantrix/data/sources/UIBridgeDataSource';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { normalizeRoomCode } from '~/shared/net/RoomTransport';

export function useJoinLobby() {
	return {
		/** The room code is the lobby id — one room, one lobby, one identifier. */
		joinByCode(code: string, playerId: string) {
			emitDomainEvent(WindowDomainEvents.join_game_request, {
				lobbyId: normalizeRoomCode(code),
				playerId,
			});
		},
		cancelJoin() {
			emitDomainEvent(WindowDomainEvents.cancel_game_request, null);
		},
	};
}
