import { emitDomainEvent } from '~/app/yantrix/data/sources/UIBridgeDataSource';
import { WindowDomainEvents } from '~/app/yantrix/windowDomainEvents';

/**
 * Declaring yourself ready — or taking it back.
 *
 * The host owns the roster, so this only *asks*: the event drives the lobby FSM
 * locally (so the button reacts at once) and `DomainCommandsDataDestination`
 * writes it through {@link RoomService}. The authoritative answer comes back as
 * a room snapshot, which the query cache turns into `player_state_change`.
 *
 * `isReady` travels as 0/1 rather than a boolean: the FSM's `game_ready`
 * predicate sums the ready map.
 */
export function useToggleReady() {
	return {
		setReady(lobbyId: string, playerId: string, isReady: boolean) {
			emitDomainEvent(WindowDomainEvents.player_ready_changed, {
				lobbyId,
				playerId,
				isReady: isReady ? 1 : 0,
			});
		},
	};
}
