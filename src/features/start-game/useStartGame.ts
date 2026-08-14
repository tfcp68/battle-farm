import { emitDomainEvent } from '~/app/yantrix/data/sources/UIBridgeDataSource';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';
import { canStart } from './canStart';

/**
 * The host closes the lobby and deals.
 *
 * `game_start` was declared and subscribed to from the very first diagram, but
 * nothing ever emitted it — the whole match engine sat behind a button that was
 * never wired. This is that wire.
 *
 * The room code doubles as the match id: `seedFromRoomCode` turns it into the
 * deal, so every peer that knows the code builds the same board without anyone
 * sending one.
 */
export function useStartGame() {
	return {
		canStart,
		startGame(lobbyId: string, playerIds: readonly string[]) {
			emitDomainEvent(WindowDomainEvents.game_start, {
				gameId: lobbyId,
				playerIds: [...playerIds],
				lobbyId,
			});
		},
	};
}
